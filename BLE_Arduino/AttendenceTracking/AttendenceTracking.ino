#include <NimBLEDevice.h>
#include "mbedtls/ecdsa.h"
#include "mbedtls/ctr_drbg.h"
#include "mbedtls/entropy.h"
#include "mbedtls/sha256.h"

// ================== CONFIGURABLE PARAMETERS ==================
#define ROOM_NAME      "LR001"   // Classroom identifier
#define ADV_INTERVAL   500       // ms between BLE packets (inside active window)
#define ADV_DURATION   15000     // ms broadcasting duration each cycle
#define ADV_CYCLE      40000     // ms total cycle (broadcast + idle)

// =============================================================
NimBLEAdvertising* pAdvertising;
bool advertisingActive = false;
unsigned long lastCycleTime = 0;

// ECC context
mbedtls_ecdsa_context ecdsa;
mbedtls_ctr_drbg_context ctr_drbg;
mbedtls_entropy_context entropy;
mbedtls_ecp_group ecp_group;

// Private key will be generated once per device
mbedtls_mpi d; // private key
mbedtls_ecp_point Q; // public key

// ============ UTIL: Generate digital signature ============
String generateSignedMessage() {
    unsigned long now = millis() / 1000;
    String payload = String(ROOM_NAME) + "|" + String(now);

    // Hash payload
    unsigned char hash[32];
    mbedtls_sha256((const unsigned char*)payload.c_str(), payload.length(), hash, 0);

    // Prepare signature buffer
    unsigned char sig[MBEDTLS_ECDSA_MAX_LEN];
    size_t sig_len = 0;

    int ret = mbedtls_ecdsa_write_signature(&ecdsa, MBEDTLS_MD_SHA256,
                                            hash, sizeof(hash),
                                            sig, sizeof(sig), &sig_len,
                                            mbedtls_ctr_drbg_random, &ctr_drbg);

    if (ret != 0) {
        Serial.printf("Signature error: -0x%04X\n", -ret);
        return "ERR";
    }

    // Convert signature to hex
    String sigHex = "";
    for (size_t i = 0; i < sig_len; i++) {
        char buf[3];
        sprintf(buf, "%02X", sig[i]);
        sigHex += buf;
    }

    return payload + "|" + sigHex;
}


// ============ Start BLE Advertising ============
void startAdvertising() {
    String message = generateSignedMessage();
    Serial.println("Broadcasting: " + message);

    NimBLEAdvertisementData advData;
    advData.setName("ESP32_ATTEND");

  
    std::string stdMessage(message.c_str());
    advData.setManufacturerData(stdMessage);

    pAdvertising->setAdvertisementData(advData);
    pAdvertising->start();

    advertisingActive = true;
    lastCycleTime = millis();
}


// ============ Stop BLE Advertising ============
void stopAdvertising() {
    pAdvertising->stop();
    advertisingActive = false;
    Serial.println("Stopped advertising");
}

// ============ SETUP ============
void setup() {
    // Start serial for debug
    Serial.begin(115200);
    delay(1000);
    Serial.println("Starting Attendance Tracking Beacon...");

    // --- ECC Key Setup ---
    mbedtls_ecdsa_init(&ecdsa);
    mbedtls_ctr_drbg_init(&ctr_drbg);
    mbedtls_entropy_init(&entropy);

    const char *pers = "esp32_ecc";
    int ret = mbedtls_ctr_drbg_seed(
        &ctr_drbg,
        mbedtls_entropy_func,
        &entropy,
        (const unsigned char*)pers,
        strlen(pers)
    );

    if (ret != 0) {
        Serial.printf("CTR_DRBG seed error: -0x%04X\n", -ret);
        while (1) delay(100); // stop if ECC init fails
    }

    // Generate ECC keypair directly in ecdsa context
    ret = mbedtls_ecdsa_genkey(
        &ecdsa,
        MBEDTLS_ECP_DP_SECP256R1,   // NIST P-256 curve
        mbedtls_ctr_drbg_random,
        &ctr_drbg
    );

    if (ret != 0) {
        Serial.printf("Keygen error: -0x%04X\n", -ret);
        while (1) delay(100);
    } else {
        Serial.println("ECC keys generated successfully.");
    }

    // --- BLE Setup ---
    NimBLEDevice::init("ESP32_ATTEND");
    pAdvertising = NimBLEDevice::getAdvertising();

    // Start first broadcast cycle
    startAdvertising();
}

// ============ LOOP ============
void loop() {
    unsigned long now = millis();

    if (!advertisingActive && (now - lastCycleTime >= ADV_CYCLE)) {
        startAdvertising();
    }

    if (advertisingActive && (now - lastCycleTime >= ADV_DURATION)) {
        stopAdvertising();
    }
}
