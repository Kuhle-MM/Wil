package vcmsa.projects.varsitytracker

import android.app.ComponentCaller
import android.app.PendingIntent
import android.content.Intent
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.MifareClassic
import android.nfc.tech.NdefFormatable
import android.nfc.tech.NfcA
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class Login : AppCompatActivity() {

    private lateinit var nfcAdapter: NfcAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        Log.d("Login: ", "App has started, please login.")
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.login_page)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.loginLayout)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Initialize NFC adapter
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)

        // Check if NFC is supported on the device
        if (nfcAdapter == null) {
            Toast.makeText(this, "NFC is not supported on this device", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    override fun onResume() {
        super.onResume()

        val intent = Intent(this, javaClass).apply {
            addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_MUTABLE)

        val techLists = arrayOf(
            arrayOf(NfcA::class.java.name),
            arrayOf(MifareClassic::class.java.name),
            arrayOf(NdefFormatable::class.java.name)
        )
        nfcAdapter.enableForegroundDispatch(this, pendingIntent, null, techLists)
    }

    override fun onPause() {
        super.onPause()

        nfcAdapter.disableForegroundDispatch(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)

        if (NfcAdapter.ACTION_TECH_DISCOVERED == intent.action) {
            val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)

            val id = tag?.id?.joinToString(":") { byte -> "%02X".format(byte) }
            if (id != null) {
                val technologies = tag.techList

                if (technologies.contains(MifareClassic::class.java.name)) {
                    handleMifareClassic(tag)
                    Log.d("Tag is: ", tag.toString())
                } else if (technologies.contains(NfcA::class.java.name)) {
                    handleNfcA(tag)
                    Log.d("Tag is: ", tag.toString())
                } else if (technologies.contains(NdefFormatable::class.java.name)) {
                    handleNdefFormatable(tag)
                    Log.d("Tag is: ", tag.toString())
                }

                loginWithTag(id)
            }
        }
    }

    private fun handleMifareClassic(tag: Tag) {
        val mifareClassic = MifareClassic.get(tag)
        Toast.makeText(this, "Mifare Classic tag detected", Toast.LENGTH_SHORT).show()
    }

    private fun handleNfcA(tag: Tag) {
        val nfcA = NfcA.get(tag)
        Toast.makeText(this, "NfcA tag detected", Toast.LENGTH_SHORT).show()
    }

    private fun handleNdefFormatable(tag: Tag) {
        val ndefFormatable = NdefFormatable.get(tag)
        Toast.makeText(this, "NdefFormatable tag detected", Toast.LENGTH_SHORT).show()
    }

    private fun loginWithTag(tagId: String) {
        if (tagId == "7C:CA:20:64") {
            Toast.makeText(this, "Login successful!", Toast.LENGTH_SHORT).show()

            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
            finish()
        } else {
            Toast.makeText(this, "Unrecognized card", Toast.LENGTH_SHORT).show()
        }
    }
}
