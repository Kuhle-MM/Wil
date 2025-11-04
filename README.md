# WIL Documentation

BCAD3

WIL DOCUMENTATION

LECTURER: COURTENEY YOUNG

GROUP MEMBERS:

KELLY BOTHA (ST10258494)

ALIZIWE QEQE (ST10382076)

GEORGE BEKKER (ST10284732)

KUHLE MLINGANISO (ST10259861)

APHIWE MHOTWANA (ST10085670)

HLUMELO NTWANAMBI (ST10383786)


# OVERVIEW

AttndEase is a modern attendance management system designed to simplify and improve tracking for both students and lecturers. The system integrates Quick Response (QR) code scanning functionality and Bluetooth technology, to create a seamless, secure, and user-friendly attendance tracking process.


### HOW IT WORKS

The system begins with administrators registering students and lecturers, thereby establishing a central database. Unique QR codes are generated for each lesson, ensuring that every session is securely logged. Students and lecturers scan these QR codes using their mobile devices to clock in and out, replacing the traditional manual signing of registers. The use of mobile phones makes the process intuitive and accessible.

Bluetooth signals further enhance accuracy by verifying attendance in real time. Through Bluetooth Low Energy (BLE) identifiers, which are integrated into the ESP32 CYD the system can detect user presence within a specific range, preventing proxy attendance and ensuring authenticity.


### EFFICIENCY AND TRANSPARENCY

AttndEase strengthens efficiency by generating real-time attendance records. These records provide transparency for students, while lecturers benefit from accurate reporting that can be viewed, saved, and downloaded into spreadsheets for further analysis. The automation reduces administrative burdens and eliminates errors that commonly occur in manual systems.


### TECHNOLOGICAL FOUNDATION

The platform combines ESP32 CYD devices, React Native mobile applications, and Azure cloud services. The mobile application contains a camera to scan the unique QR code displayed on the ESP32 CYD screen. The BLE then confirms user presence. This data is securely transmitted to Azure-hosted APIs for validation, storage, and ease of scalability. The system is compatible with both iOS and Android, ensuring inclusivity across devices.


### SMART FEATURES

Seamless clock-ins using QR code scanning.

Secure Bluetooth-based verification to prevent fraudulent entries.

Cloud integration via Azure for real-time logging.

User dashboards providing personalized attendance summaries.


## Github Repo links


## Kanban link


# INTRODUCTION

The AttndEase system is an innovative attendance management solution designed to simplify and enhance the process of tracking attendance for students. Traditional methods of attendance monitoring, such as paper registers and manual signatures, are prone to errors, forgery, and inefficiencies. AttndEase addresses these challenges by combining advanced technologies including an ESP32 CYD microcontroller, QR code scanning, Bluetooth Low Energy (BLE) signals, React Native mobile applications, and Azure cloud services to create a dependable, real-time, and user-friendly attendance tracking system.

Students and lecturers interact seamlessly with the system using smartphones or tablets, while administrators manage the registering of users through the mobile application. Unique QR codes and BLE UUIDs are used for each session, ensuring accurate verification of presence, while Azure Table Storage and Blob Storage provide scalable and secure data management. The system incorporates robust security measures, offline fallback mechanisms, and real-time notifications to maintain reliability and transparency.

Furthermore, AttndEase fosters adoption through personalized, simple, and efficient workflows. The integration of IoT devices, mobile apps, and cloud infrastructure ensures that attendance tracking is fast, error-free, and adaptable across classrooms and institutions, supporting both iOS and Android users. The solution emphasizes operational efficiency, user engagement, and administrative oversight, making it suitable for large-scale deployment in educational environments.

AttndEase strengthens efficiency by generating real-time attendance records. These records provide transparency for students, while lecturers benefit from accurate reporting that can be viewed, saved, and downloaded into spreadsheets for further analysis. The automation reduces administrative burdens and eliminates errors that commonly occur in manual systems.


## Work agreement

The development of the AttndEase was guided by a clear and structured work agreement that ensured efficiency, accountability, and quality throughout the project lifecycle. The team collectively agreed to adhere to established software engineering principles, maintain consistent communication, and deliver all project components within agreed timelines and quality standards.

Each member committed to adopting agile methodologies, enabling iterative development and early testing of core functionalities. Regular stand-up meetings were conducted to track progress, address challenges, and allocate new tasks effectively. Version control was maintained through GitHub, ensuring seamless collaboration and code integrity. Documentation was continuously updated to reflect architectural changes, feature implementations, and integration details.

The work agreement emphasized collaboration, transparency, and adaptability. Any proposed feature or change in the scope was discussed and validated collectively before implementation to maintain project alignment. Code reviews and testing sessions were held routinely to ensure the stability, security, and performance of the system. The overarching goal was to deliver a functional, dependable, and scalable product that could be easily adopted by both lecturers and students within an educational institution.


### Team responsibilities

To ensure smooth execution, each role within the project team was defined with clear responsibilities and deliverables.


#### PROJECT MANAGER / TEAM LEAD

The project manager (Aliziwe Qeqe) was responsible for overseeing the entire development cycle, ensuring deadlines were met and resources were effectively allocated. Coordinated team meetings were held, version control was managed, milestones were verified, and alignment with project objectives was ensured. The project manager also acted as the primary liaison between developers, testers, and the client, maintaining documentation and quality assurance standards throughout the process.


#### BACKEND DEVELOPER (C# / AZURE)

The backend developer (Kelly Botha) focused on designing and implementing the API layer using C# and ASP.NET Core. Responsibilities included creating all the necessary endpoints for attendance clock-ins, user authentication and registration, and report generation and monitoring. Integration with Azure Table Storage and Blob Storage was handled, ensuring data consistency, encryption, and compliance with security standards such as password hashing and salting. Validation logic was implemented for time-based clock-ins and worked alongside the database administrator (George Bekker) to construct accurate data models and error handling.


#### MOBILE DEVELOPER (REACT NATIVE)

The mobile developer (George Bekker) was responsible for building the React Native application for both iOS and Android platforms. Duties included implementing constructing the overall set-up of the React Native project, compiling the mobile application, BLE scanning (which was primarily handled by the hardware engineer, Kuhle Mlinganiso), QR code camera capturing (which was primarily constructed by Aliziwe Qeqe) and user interface design. Seamless navigation was ensured, by means of a bottom and side navigation.


#### hardware engineers (ESP32 CYD  / EMBEDDED SYSTEMS)

The hardware engineers (Kuhle Mlinganiso and Hlumelo Ntwanambi) worked with the Hardware Design Engineer (Aphiwe Mhotwana) to handle the firmware development for the ESP devices. Responsibilities included configuring BLE scanning for UUID detection, generating QR codes, and securely transmitting clock-in data to the Azure-hosted APIs. Safeguards were implemented to prevent multiple clock-ins per session and optimized device energy consumption, connection reliability, and real-time responsiveness. Both hardware engineer and 3D model lead were responsible for implementing DevSecOps pipelines using GitHub Actions, in order to ensure automated builds, tests, and deployments.


#### CLOUD ENGINEER

The cloud engineer (Kelly Botha) managed the deployment and configuration of cloud resources within Microsoft Azure. This included setting up Azure Table Storage, Blob Storage, and Azure App Services.


#### UI/UX DESIGNER

The UI/UX designer (George Bekker, Aliziwe Qeqe and Kelly Botha) ensured that the system remained intuitive and visually consistent. User flow diagrams and wireframes were developed to optimize usability and engagement. Accessibility standards were maintained, ensuring colour contrast, legibility, and responsiveness across multiple devices.


#### QUALITY ASSURANCE / TESTER

The Quality Assurance tester (Aliziwe Qeqe) conducted systematic testing across all components—mobile, backend, and IoT—to identify and resolve issues before deployment. This included unit testing, integration testing, performance testing, and user acceptance testing.


#### DOCUMENTATION & RESEARCH LEAD

The documentation lead (Aliziwe Qeqe) maintained all written deliverables, including technical documentation, user guides, and progress reports. Architectural, design, and operational details were accurately recorded.

The collective efforts of all roles ensured that AttndEase was developed as a cohesive, scalable, and secure system. The work agreement and defined team responsibilities created a structured workflow that promoted efficiency, minimized conflicts, and resulted in a professional and reliable attendance management solution suitable for institutional deployment.


## Definition of Ready (DoR)

The team’s Definition of Ready (DoR) served as a foundational agreement that ensured all user stories, features, and tasks were fully understood, clearly documented, and technically feasible before entering the development phase. It acted as a quality gate, ensuring that every backlog item met a set of predefined criteria to maintain workflow consistency, prevent rework, and uphold project standards.

A story or feature was considered as “ready” when all requirements - functional and non-functional - were defined, dependencies were identified, and acceptance criteria were measurable and testable. This ensured that the team could begin development with confidence, avoiding ambiguity and scope uncertainty.


### CRITERIA FOR DEFINITION OF READY

Clear Business Objective
Each feature or user story had to clearly explain why it was being developed and what value it would deliver to the user. For example, “Students should be able to clock in via QR code” was only accepted once its relevance to attendance accuracy and user convenience was established.

Detailed Functional Description
All functional details had to be explicitly stated, including expected inputs, outputs, and system behaviour. The flow between mobile app, ESP, and backend API was documented using diagrams to ensure cross-team understanding.

Acceptance Criteria Defined
Measurable acceptance criteria were included for every task. For instance, “A successful clock-in and clock-out must log timestamp, and device ID to Azure Table Storage.” The story was only marked ready once these criteria were testable and aligned with expected outcomes.

Dependencies Identified
Any external dependencies - such as ESP32 CYD firmware updates, API endpoints, or Azure configurations - had to be identified and resolved before development began. Stories were not accepted if blocked by hardware setup, access permissions, or unresolved backend logic.

UI/UX Assets Finalized
The React Native design components, layout mock-ups, and interaction flows were reviewed and approved by both the UI/UX designer and project manager to ensure feasibility. Colour schemes, navigation patterns, and responsiveness considerations were validated in advance.

Security and Compliance Reviewed
Before any development began, stories involving data capture, user authentication, or device communication were reviewed.

Test Cases Outlined
Unit and integration test cases were drafted in advance to confirm that the story’s functionality could be verified. For example, simulated clock-ins and clock-outs were used to confirm that duplicate scans were not accepted.

Estimate Assigned and Approved
Every ready story had a defined effort estimate, reviewed, and agreed upon by all team members. Estimations were done collaboratively using complexity discussions rather than time-based guessing, ensuring accuracy and shared accountability.

No Outstanding Questions or Ambiguities
A story was not considered ready if any member—developer, tester, or researcher—had unresolved questions. Clarity across all roles was mandatory before moving the story into active development.


### PURPOSE AND BENEFIT

By adhering to the Definition of Ready, the team maintained an elevated level of discipline and quality assurance from the earliest phase of each iteration. It ensured that every sprint began with work items that were actionable, testable, and achievable within the defined period. This reduced delays, prevented scope creep, and established a predictable, professional workflow.

The DoR ultimately strengthened collaboration between mobile, backend, and IoT developers by eliminating confusion before coding began. This approach aligned with the project’s agile framework, prioritizing clarity, consistency, and confidence before execution, thereby enabling AttndEase to progress smoothly from planning to deployment.


## Definition of Done (DoD)

The team’s Definition of Done (DoD) served as a collective agreement on what constituted a fully completed and deliverable task, feature, or iteration within the AttndEase attendance management system. It established a shared understanding between developers, testers, and project leads that a feature was not “done” until it met functional, technical, and quality standards across all layers, which includes mobile app, backend, and IoT devices.

This definition ensured transparency in progress tracking, consistency in quality, and accountability across all contributors. Every user story had to meet the DoD before being moved to completion, merged into the main branch, or demonstrated to stakeholders.


### CRITERIA FOR DEFINITION OF DONE

Code Completeness and Functionality
All code must be written, compiled, and executed without errors. Each feature must operate exactly as defined in the user story, with all expected inputs producing verified outputs. For example, BLE or QR clock-ins must log accurate timestamps, device IDs, and student identifiers to Azure Table Storage without duplication.

Acceptance Criteria Fulfilled
Every acceptance criterion outlined in the Definition of Ready must be validated through testing and demonstration. The functionality must perform as described, ensuring alignment with both technical specifications and user expectations.

Peer Review and Code Quality
Code must undergo peer review before merging into the main repository. Reviews focus on clarity, maintainability, and adherence to coding standards. For backend APIs, consistent structure, naming conventions, and secure data handling were mandatory. For ESP32 CYD, readability and efficient BLE/QR scanning cycles were verified.

Testing Completed and Passed
All test cases - unit, integration, and system-level - must be successfully executed. No critical or high-severity bugs are acceptable at completion. React Native components were validated through device testing on both iOS and Android, while backend services were verified via automated and manual API calls.

Security Validation Conducted
The feature must comply with all security protocols. This includes validating hashed credentials, ensuring secure API tokens, and confirming proper handling of user data under POPIA regulations. BLE UUIDs and QR payloads were checked to prevent spoofing or unauthorized reuse.

Performance Verified
The implemented feature must meet expected performance benchmarks. BLE scanning, QR decoding, and API response times must remain within acceptable latency limits. Any device-side delays or network inefficiencies must be addressed before closure.

Documentation Updated
Technical documentation, including architecture diagrams, setup instructions, and feature overviews, must be updated. This applied to code comments, README sections, and deployment scripts. Any modification in data flow or API endpoints was required to be recorded for future maintenance.

Deployment Verified
The completed feature must be successfully deployed to the designated environment whether that may be local, staging, or Azure-hosted production. The deployment pipeline (CI/CD) had to run without failures, confirming version control, artifact generation, and environment consistency.

User Experience Validated
The final user interface must match approved mock-ups and meet usability standards. Elements such as button placement, screen transitions, and accessibility features (e.g., colour contrast, font readability) must be reviewed and validated.

Audit and Traceability Ensured
All logs, timestamps, and device identifiers must be traceable. For attendance clock-ins, clock-outs each record must include a verifiable source (ESP32 CYD ID, user ID, and session timestamp). This ensured reliability and transparency for lecturers, administrators, and auditors.

Stakeholder Approval Obtained
A feature was considered “done” only after the project supervisor or designated reviewer confirmed it met the intended purpose. Demonstrations or sprint reviews were conducted to highlight completion and gather validation.

No Outstanding Tasks or Defects
A story was not closed if any subtask, bug, or dependency remained unresolved. Only fully stable, functional, and integrated work could be classified as “done.”


### PURPOSE AND BENEFIT

The Definition of Done ensured uniform quality across all modules, from mobile interactions to cloud storage. It prevented incomplete or unstable work from progressing downstream and promoted accountability across the development lifecycle.

By following this structured DoD, the team-maintained reliability in each release, ensuring that deployed features were not only functional but also secure, scalable, and production-ready. This systematic approach upheld the project’s integrity and demonstrated a commitment to professional software engineering practices.

Ultimately, this definition guaranteed that every increment delivered through AttndEase was usable, verifiable, and aligned with both technical excellence and stakeholder expectations.


## Roadmap (High-level plan)

The project roadmap served as the strategic guide for the design, development, and deployment of the AttndEase attendance management system. It outlined the sequence of milestones, sprint timelines, and resource allocation throughout the project lifecycle. This roadmap ensured that all deliverables were completed within defined periods, aligning team efforts with technical and academic objectives.

The roadmap was structured around a four-phase iterative development model, allowing for flexibility in implementation while maintaining consistent progress across all system components - mobile app (React Native), backend (C# API and Azure integration), and IoT hardware (ESP32 CYD with BLE and QR functionality).


### 1. PHASE 1 – PROJECT FOUNDATION

Objective: Establish system architecture, define scope, and set up development environments.

Key Deliverables:

Requirement analysis and use-case documentation

System architecture diagram (mobile, backend, and IoT interaction)

Azure resource setup (functions, table storage, and API endpoints)

Git repository creation and branch management strategy

Initial mobile app scaffold (React Native project setup)

Sprint Duration: 2 weeks
Team Focus: Planning and technical environment configuration


### 2. PHASE 2 – CORE FEATURE DEVELOPMENT

Objective: Develop and integrate essential system functionalities.

Key Deliverables:

ESP32 CYD configuration for BLE and QR-based generation

Mobile application UI and user authentication (Log In, Register, and Dashboard)

Backend API endpoints for user data, attendance logs, and device mapping

Data flow validation between IoT device, mobile, and cloud components

Implementation of secure communication protocols (HTTPS, encrypted tokens)

Sprint Duration: 8 weeks 
Team Focus: Active coding, integration, and unit testing


### 3. PHASE 3 – TESTING AND REFINEMENT

Objective: Validate functionality, reliability, and performance of all integrated modules.

Key Deliverables:

System testing (functional, integration, and device communication tests)

Performance analysis for BLE signal reliability and QR scan speed

Security testing for API endpoints and user data encryption

Bug identification and resolution

Preliminary demonstration to supervisor for feedback

Sprint Duration: 2 weeks
Team Focus: Quality assurance, debugging, and validation


### 4. PHASE 4 – FINAL DEPLOYMENT AND PRESENTATION

Objective: Prepare final deployment, documentation, and system presentation.

Key Deliverables:

Azure-hosted deployment of backend and cloud functions

Final build of the React Native mobile app

Submission of technical documentation (README, architecture diagrams, and test results)

Project presentation and demonstration to stakeholders

Post-project review and retrospective session

Sprint Duration: 2 weeks
Team Focus: Final integration, polish, and delivery


### SPRINT STRUCTURE AND DURATION

Sprints followed a consistent pattern:

Day 1: Sprint planning and backlog refinement

Midpoint: Stand-up meeting for progress alignment and issue tracking

End of Sprint: Code review, testing verification, and sprint retrospective

This structure ensured continuous progress tracking and accountability across the team, while maintaining adaptability to address evolving project requirements.


### TEAM AVAILABILITY

The project team coordinated availability based on academic schedules and technical workload. Availability was organized to ensure consistent collaboration and fair workload distribution:

Collaboration was maintained through shared repositories (GitHub), weekly meetings (virtual or in-person), and continuous communication via messaging channels.


### SUMMARY

This roadmap provided a clear, time-bound structure that guided the team from conception to deployment. By defining each phase with measurable deliverables and consistent sprint durations, the team-maintained control over progress and quality.

The emphasis on parallel development, combining IoT hardware, mobile application logic, and Azure-based backend integration, ensured that AttndEase was built systematically, tested rigorously, and deployed reliably.

Through disciplined adherence to this roadmap, the project achieved a balance between innovation, functionality, and timely completion.


# REQUIREMETS


## User Roles

The AttndEase attendance management system operates through a structured framework of roles, each contributing to the seamless flow of attendance tracking. These roles include the Student/User, Administrator/Lecturer, the Device (ESP32 CYD ), and the System Backend. Each role carries specific responsibilities designed to ensure accuracy, transparency, and efficiency within the ecosystem.


### STUDENT / USER

Students and users are at the core of AttndEase. Their role is simple yet crucial in ensuring accurate attendance tracking.

App Launch: Students begin by logging into the AttndEase mobile application, available on both iOS and Android platforms.

Clock-in Process: They open the QR camera on their app dashboard and scan the QR code generated for the specific lesson on the ESP32 CYD device.

Verification: Once scanned or broadcasted, the app confirms the successful clock-in, providing real-time feedback to the user. This step ensures transparency and prevents ambiguity in attendance records.

This role emphasizes accessibility and user-friendliness, ensuring that students can engage with the system effortlessly using familiar devices.


### LECTURER

Lecturers play a supervisory and monitoring role within AttndEase. Their responsibilities ensure the reliability and security of the system.

Attendance Logs: They have access to real-time attendance logs, enabling them to monitor which students have clocked in and at what times at the end of the lesson, once the report is generated.

Device Registration: Administrators register ESP32 CYD devices to the system, ensuring that only authorized devices are deployed in classrooms. This prevents unauthorized scanning and strengthens security.

Through these responsibilities, the lecturer role ensures oversight and smooth functioning of the attendance ecosystem.


### Administrator

Administrators are crucial for the registration of both students and lecturers. They are also responsible for the addition of modules that lecturers and students are able to add to their account.

Registration: The creation of email addresses, passwords and role assignment for students and lecturers is the responsibility of the administrator.

Lesson Creation: Lessons are created so that both students and lecturers can view and add them to their account

Through these responsibilities, the administrator role ensures smooth and reliable functioning of the attendance ecosystem.


### DEVICE (ESP32 CYD )

The ESP32 CYD  device serves as the physical gateway for attendance verification, functioning as the interface between user actions and the system backend.

Scanning: Equipped with camera modules (ESP32 CYD), the device scans QR codes presented on student phones.

Data Transmission: After capturing clock-in information, the device transmits this data securely to the backend API for validation.

This role transforms physical student actions into digital records, ensuring that attendance capture is immediate, secure, and accurate.


### SYSTEM (BACKEND)

The backend system serves as the central intelligence of AttndEase. Its function is to authenticate, validate, and securely store all attendance data.

Authentication: Every clock-in request is authenticated to verify the legitimacy of the device and user. This step ensures that only registered students and authorized devices are allowed access.

Logic Validation: The backend validates the context of each clock-in. For example, it checks whether the student is within the valid period for attendance or whether duplicate entries exist.

Data Storage: Once authenticated and validated, the data is securely stored in Azure databases. This ensures long-term record-keeping, cloud accessibility, and integration with reporting tools.

Through these functions, the backend ensures the trustworthiness, security, and reliability of the system.

The integration of these roles (Student, Administrator and Lecturer), Device (ESP32 CYD), and System Backend creates a balanced and highly effective attendance ecosystem. Students benefit from a simple clock-in and clock-out process, lecturers gain accurate attendance reports, administrators gain control of their institution’s system, devices handle the physical scanning and data relay, while the backend ensures authentication and secure storage. Together, these roles reinforce AttndEase’s commitment to accuracy, efficiency, and digital transformation in attendance management.


## User Stories

The AttndEase attendance management system is designed around clearly defined user stories that capture the needs and expectations of each stakeholder. These stories serve as the foundation for ensuring usability, reliability, and efficiency across the ecosystem. By understanding the goals of students, administrators, and devices, the system delivers a comprehensive solution that addresses both practical and technical requirements.


### Student User Stories

Students form the largest user group within AttndEase, and the system prioritizes their ease of use and accessibility.

User1: As a student, I want to launch the application and clock-in via QR code so that I can mark my attendance effortlessly. This ensures that participation in attendance tracking is quick and requires minimal effort, while supporting both QR code scanning.

User2: As a student, I want to see confirmation of my clock-in so that I know the process was successful. This feedback loop provides reassurance and transparency, confirming to the student that their attendance has been securely recorded.

User3: As a student, I want to be able to clock-in even if I use iOS so that my platform does not limit participation. Cross-platform compatibility ensures inclusivity, allowing both iOS and Android users to engage seamlessly with the system, eliminating technical barriers.

These stories emphasize usability, accessibility, and trust, ensuring that students interact with AttndEase through a smooth and reliable experience.


### Lecturer User Stories

Lecturers play a vital oversight role, ensuring the integrity of attendance tracking while managing the hardware and data environment.

Lecturer1: As lecturer, I want to see attendance logs with timestamps so that I can track student participation. This feature provides detailed insights into attendance patterns and allows for reliable record-keeping.

This story highlights transparency, and the importance of lecturer oversight in reinforcing trust within the system.


### Administrator User stories

Adins play a crucial role in ensuring the smooth running and accuracy of the initial input data of the system.

Administrator: As administrator, I want to register which ESP32 CYD  device belongs to which room so that I can ensure valid clock-in locations. This responsibility strengthens security and accuracy, ensuring that only authorized devices in legitimate classrooms can log attendance data.

This story highlights accountability, and the importance of administrator oversight in reinforcing trust within the system.


### Device (ESP32 CYD  and ESP32 CYD -CAM) User Stories

The devices act as the physical layer of the ecosystem, bridging human interaction and backend validation.

Device1: As an ESP32 CYD device, I want to generate unique QR codes per lesson so that I can send the unique identifier to the API. I want to also scan for nearby BLE devices and extract UUIDs so that I can verify attendance in real-time. This functionality automates presence detection and minimizes manual intervention, ensuring accurate and immediate records.

These stories demonstrate the role of embedded hardware in enabling secure, automated, and real-time attendance capture.

The user stories in AttndEase illustrate a well-balanced ecosystem that integrates the needs of students, administrators, and devices. Students are assured a simple and transparent attendance experience, administrators maintain oversight and device security, while ESP32 CYD  devices enable the seamless capture and transfer of attendance data. Together, these stories align to create a dependable, inclusive, and efficient attendance management solution that ensures accuracy and trust for all stakeholders.


## User Experience Journey Map


### STUDENT USER EXPERIENCE JOURNEY – BLE (ANDROID)

The Bluetooth Low Energy (BLE) clock-in flow for students represents one of the most seamless and automated user experiences within AttndEase. This journey illustrates how a student interacts with the system step by step, from opening the mobile app to receiving confirmation of their attendance. Each stage combines touchpoints, emotions, and actions to demonstrate how user engagement is fostered and how technology simplifies the attendance process.


#### Step 1: Opening the Application

The journey begins with the student launching the AttndEase mobile application, developed in React Native to ensure cross-platform usability. At this point, the key touchpoint is the intuitive and responsive user interface. The student’s emotion can be described as curious but neutral since no attendance action has yet occurred.

Upon opening, the application prompts the user to log into their account. Once logged in, the user is greeted by a friendly dashboard that contains their modules for today, their current progress for the week, viewed via a progress bar, an option to view their attendance report, or view their weekly calendar of their modules, as well as a camera button to scan the QR code generated. The student is able to add modules that they are currently taking for the semester in order for their calendar to populate and their daily modules to display.


#### Step 2: Entering the Classroom

As the student walks into a classroom, they open the QR camera and scan the QR code that has been generated by the ESP32 CYD. Once scanned, a message will pop-up informing the user whether they have been successfully clocked into the lesson, or not. If the student tries to clock in again, an error message will appear informing the user that they are unable to clock in, as they have already done so.

This process initiates the BLE to verify the student’s device in the vicinity. This is called a ‘ping.’ Pings are sent out upon initial clock in of the student, within the lesson, and five minutes before the lesson ends. If the BLE only registers/verifies one ping from the user, then they will be marked as absent; if it picks up two pings, the student is still marked as absent; however, if the BLE picks up three pings, then the student is marked as present. 
(In cases where a student was in the bathroom during one of the pings, lecturers are able to manually override the status of a student in the report generated.)

At this stage, the student remains neutral in emotion, as the process happens passively and invisibly. They do not need to take further action, ensuring that attendance is recorded even if the student is distracted or focused on the lecture. This automatic handoff between the student’s device and the classroom ESP32 CYD  emphasizes minimal intrusion and maximum convenience.


#### Step 3: Confirmation of Clock-in

The third and final touchpoint is the confirmation of successful clock-in. Once the ESP32 CYD  captures the UUID, it forwards the data to the backend API hosted on Azure. The API validates the clock-in by applying business logic such as time, classroom, and device authorization before securely logging the attendance record into the Azure database.

The mobile app then provides immediate feedback through a toast notification or similar confirmation message. At this point, the student’s emotion shifts from neutral to satisfied, as they gain assurance that their attendance has been accurately recorded. This moment of validation closes the feedback loop, reinforcing trust and reliability in the system.


### Overall Journey Impact

The BLE (Android) student experience is designed to be fast, dependable, and almost invisible to the user. By combining React Native interfaces, background UUID broadcasting, and ESP32 CYD scanning, AttndEase eliminates manual attendance hurdles while ensuring security and accuracy.

The emotions in the journey map reflect a deliberate progression: initial curiosity at app launch, neutrality during passive detection, and satisfaction upon confirmation. This emotional arc demonstrates how AttndEase balances automation with transparency, ultimately providing students with confidence in a system that works for them rather than against them.


### LECTURER USER EXPERIENCE JOURNEY

The journey for lecturers illustrates the managerial and supervisory dimension of AttndEase. Unlike the student flow, which emphasizes accessibility and ease of clock-in, the lecturer’s experience centres on data oversight, validation, and reporting. The process integrates directly with the web-based dashboard, hosted on Azure App Services, enabling secure access across devices and ensuring data consistency in real time.


#### Step 1: Logging into the Dashboard

The lecturer begins the process by navigating to the AttndEase dashboard through the mobile application. Authentication occurs through Azure App Service, ensuring identity verification and access control measures are strictly enforced.

The lecturer’s emotional state is professional and task oriented. The expectation is efficiency, accuracy, and reliability in retrieving attendance records. The dashboard interface presents an organized view of clock-in logs. These include timestamps, student identifiers, session details, and device mappings. The logs represent the system’s assurance of transparency and integrity in attendance tracking.

Lecturers are greeted with the option to add modules to their account, view their daily modules, view their modules for the week, begin a lesson, and end a lesson.


#### Step 2: Filtering Attendance Records

To extract meaningful insights, the lecturer selects which lesson he/she would like to view the attendance of. Once selecting, they are able to also override statuses of particular students if the system incorrectly assigned their statuses (e.g. in cases where a student went to the tuckshop and missed the BLE pinging range.) The lecturer’s emotional state transitions to confidence. The override can then be saved. The lecturers are also able to download any of the reports for any of their lessons. This allows them to do further analysis on the reports of their students effortlessly.


#### Step 3: Exporting Attendance Logs

Once satisfied with the report, the lecturer moves towards exporting attendance logs. The system provides export capabilities in CSV formats, supporting integration with existing institutional reporting systems.

At this stage, the lecturer’s emotional state is empowerment. The ability to export precise, validated data removes reliance on fragmented processes and equips the lecturer with accurate records suitable for formal attendance sheets, performance tracking, or compliance audits. The exported dataset becomes evidence of fairness and accuracy, reinforcing trust between lecturers, students, and the institution.


#### Overall Journey Impact

The lecturer’s journey within AttndEase is characterized by efficiency, reliability, and accountability. Beginning from a professional stance of expectation, moving into confidence through refined data validation, and concluding with empowerment through exportable, actionable reports, the flow represents an optimized management cycle.

The combination of Azure App Service for authentication, dashboard filters for verification, and export functionality for institutional reporting ensures a seamless experience. By enabling lecturers to easily monitor, validate, and share attendance data, AttndEase removes the inefficiencies of traditional methods and introduces a digital system of record that is transparent, tamper-resistant, and inclusive.

The lecturer’s journey, therefore, is not limited to viewing attendance; it extends into governance, compliance, and academic integrity. Through this, AttndEase establishes itself as more than an attendance tracker—it becomes an administrative partner, reinforcing professionalism and trust across educational ecosystems.


# NON-FUNCTIONAL REQUIREMENTS

Non-functional requirements define the qualities, constraints, and overarching expectations that shape AttndEase into a dependable, secure, and scalable attendance management platform. They extend beyond functional operations, ensuring that the system is not only usable but also compliant, resilient, and adaptable in academic environments.


### CLIENT-SPECIFIED: TIMETABLE/calendar SET-UP FOR STUDENTS

A central requirement for enhancing student engagement lies in the inclusion of a timetable management feature. Students will be provided with a view-only interface of their module timetable, reinforcing academic accountability while reducing scheduling conflicts.

Modules that appear on the institutional timetable may be added by students into the integrated calendar feature within AttndEase. This calendar supports cross-referencing of attendance sessions with scheduled lessons, ensuring both consistency and accuracy.

In-app banner act as reminders of daily lessons, sent to students and lecturers.


### USABILITY

Usability governs the interface and interaction design of the mobile and web applications. The requirement emphasizes an intuitive layout, designed to minimize friction and reduce the learning curve.

Ease of use is realized through bottom navigation and side navigation, consistent across all platforms, giving students, lecturers, and administrators immediate access to essential features without confusion. All system features appear on a central dashboard, tailored to the role of the user. For both students and lecturers their daily modules, weekly calendar, and viewing and adding of all modules and report display and download. For lecturers, creating of lessons, beginning, and ending of lessons and overriding student status. For students, QR camera clock-ins and manual clocking out. For administrators, the creation of users, role assignment, and the creation of modules is displayed for them.

The guiding principle is accessibility without complexity. Whether the user is an experienced lecturer or a first-time student, the experience must remain consistent, predictable, and efficient.


### SYSTEM SCALABILITY

Scalability is defined as the system’s ability to expand horizontally across multiple classrooms, lecture halls, and entire campuses. Azure Table Storage forms the foundation of data storage, ensuring elastic growth as the volume of attendance records increases.

The system must accommodate thousands of concurrent clock-ins without degradation of service. The architecture is designed to support parallel sessions across distributed locations, ensuring that an institution with multiple buildings can rely on the same level of performance as a single classroom deployment.

Scaling horizontally is not merely a technical demand but also a reflection of institutional diversity. From small colleges to large universities, the system must adjust fluidly without requiring extensive reconfiguration.


### PERFORMANCE

Performance defines responsiveness, throughput, and system efficiency. The platform must ensure minimal latency between clock-in actions and confirmation responses.

Students should receive real-time acknowledgment of their attendance clock-in, typically within seconds, to reduce uncertainty. Lecturers accessing dashboards should experience near-instantaneous log retrieval, even when filtering across weeks of data.

Backend services must be optimized to handle peak loads, such as multiple classes beginning at the same hour, without timeouts or degraded user experience. Consistent system responsiveness is therefore a key performance criterion.


### PORTABILITY

The system must support multi-platform deployment to maximize inclusivity. React Native serves as the framework, enabling native support for both iOS and Android platforms. This ensures students and lecturers, regardless of device preference, experience uniform functionality.

Additionally, portability extends beyond devices into classroom hardware. ESP32 CYD  microcontrollers serve as lightweight yet powerful devices capable of BLE detection and QR code decoding. Their portability enables institutions to deploy them flexibly across various locations without heavy infrastructure investment.


### SECURITY

Security is foundational, ensuring all data remains protected at every stage of transmission and storage.

All data transmitted between mobile apps, ESP32 CYD  devices, and backend services must be encrypted.

Authentication controls must prevent unauthorized access, while role-based permissions restrict sensitive features to lecturers and administrators only. Device registration ensures ESP32 CYD  hardware is tied to specific locations, preventing spoofing or falsified attendance entries.


### RELIABILITY

Reliability dictates the continuity of service under variable conditions. Should the network fail, ESP32 CYD devices must support offline fallback by temporarily storing attendance logs locally, and through the use of batteries, must be able to power the ESP32 CYD device. Once connectivity is restored, the device synchronizes logs with the backend system.

This safeguard ensures that attendance integrity is maintained, even in classrooms with intermittent network coverage. The requirement extends reliability from ideal conditions into practical, real-world contexts.


### COMPLIANCE

Compliance with data protection regulations is non-negotiable. Personal information collected by the system must adhere to relevant legislation, including POPIA within South Africa and GDPR across the European Union.

This includes lawful collection, explicit user consent, secure storage, limited data retention, and user rights to access or request deletion of personal data. These measures safeguard institutional credibility while ensuring user trust.


### ADDITIONAL CONSTRUCTIVE NON-FUNCTIONAL REQUIREMENTS

To reinforce the robustness of AttndEase, further non-functional requirements are identified:

Maintainability – The system must support modular updates. Developers should be able to deploy improvements or fixes without interrupting service. Clear documentation must accompany each update to ensure continuity.

Interoperability – The platform must integrate with institutional Learning Management Systems (LMS) such as Moodle, Blackboard, or Canvas. Export formats (CSV) ensure compatibility with existing academic workflows. (This is primarily for lecturers and students when exporting reports in CSV format.)

Availability – The system must maintain 99.9% uptime, with redundancy and failover mechanisms in place to minimize disruptions.

Extensibility – The architecture must support future enhancements, such as biometric integration, NFC, or predictive analytics without requiring a full redesign.


### Overall Impact

These non-functional requirements form the backbone of AttndEase’s operational excellence. They guarantee that the system is not only functional in delivering attendance tracking but also dependable, secure, scalable, and compliant with institutional and legal expectations. From usability to auditability, each requirement strengthens the platform’s ability to serve as a trusted digital partner for students, lecturers, and administrators alike.

By embedding these qualities into its design, AttndEase transitions from being an innovative tool into a fully-fledged academic infrastructure—ensuring resilience, inclusivity, and sustainability across educational ecosystems.


# ANALYSIS ARTIFACTS


## Domain modelling


### ERD UML DIAGRAM


## Design Artifacts


### UML ERD Diagram


# IMPLEMENTATION DOCUMENTATION


### Sequence Diagram


# DATA SCHEMA DOCUMENTATION

The following is a list of the Data Schema that was used in the creating of this system includes:

C# in Visual Studio

React Native in Visual Studio Code

C++ in Arduino IDE

SQL for Azure Table Storage


# ARCHITECTURE ARTIFACTS


## Design Patterns

Design patterns provide reusable solutions to recurring architectural and development problems. For AttndEase, patterns were selected to enhance scalability, maintainability, reliability, and usability across the IoT, backend, and mobile components.


### ESP32 CYD DESIGN PATTERNS

1. Observer Pattern

ESP32 CYD devices continuously monitor for BLE signals. The Observer pattern allows the device to “observe” multiple BLE UUIDs in real-time and notify the system whenever a new device is detected.

This ensures that clock-ins are captured instantly, without polling or redundant operations.

2. Command Pattern

Commands are issued to ESP32 CYD  devices for operations such as scanning for BLE devices, or transmitting data to the backend API.

Encapsulating each action as a command allows flexible execution, retry mechanisms, and offline queuing if connectivity is lost.

3. Singleton Pattern

Ensures only one instance of the ESP32 CYD device controller handles scanning and data transmission at a time.

Prevents resource conflicts and guarantees consistent management of BLE and QR operations.


### C# API / BACKEND DESIGN PATTERNS

1. Repository Pattern

Abstracts access to Azure Table Storage for attendance logs and user accounts.

Provides a clear separation between the business logic and data access layers, ensuring maintainability and testability.

2. Factory Pattern

Used for creating attendance validation objects.

This allows the system to instantiate appropriate validators dynamically without modifying existing code, supporting extensibility.

3. Singleton / Service Locator Pattern

Ensures a single instance of critical services such as ValidationService, and LoggingService is available throughout the API.

Guarantees consistency and prevents multiple instances from sending conflicting validations.

4. Observer Pattern

Applied to the API notification mechanism. When a clock-in or clock-out is logged, subscribed clients (mobile apps) are notified in real-time via pop-up messages.

Enhances user satisfaction by providing immediate feedback on successful attendance recording.


### REACT NATIVE MOBILE APP DESIGN PATTERNS

1. Model-View-ViewModel (MVVM)

Separates UI (View) from business logic (ViewModel) and data (Model).

Ensures that updates from the backend (such as clock-in/clock-out confirmation or timetable updates) are automatically reflected in the UI without tightly coupling components.

2. Observer / Event-Driven Pattern

Observes clock-in status, push notifications, and timetable alerts.

When the backend or ESP32 CYD device confirms attendance, the UI reacts immediately, updating notifications, toast messages, or dashboard entries.

3. Factory Pattern

Promotes flexibility and simplifies support for multiple platforms (iOS and Android).

4. Singleton Pattern

Ensures that critical managers such as BluetoothManager and QRCodeManager have a single instance throughout the app lifecycle.

Reduces memory overhead and prevents conflicts in device scanning or notification handling.


### OVERALL SYSTEM DESIGN PATTERN RATIONALE

The combination of these patterns creates a system that is:

Scalable
Repositories and factories support growth in devices, users, and classrooms.

Reliable
Observer and singleton patterns ensure consistent clock-in capture and processing.

Flexible
Strategy and factory patterns allow multiple clock-in methods without changing core logic.

Maintainable
MVVM in React Native and repository patterns in C# API enable clean separation of concerns and ease of updates.

User-Centric
Observer patterns across devices, API, and mobile apps provide real-time feedback and enhance confidence in attendance recording.


## Architecture Patterns

The architecture of AttndEase is designed to ensure seamless attendance tracking while balancing scalability, security, reliability, and usability. The system follows a layered and modular approach, integrating IoT hardware, mobile applications, and cloud-based backend services into a coherent, end-to-end solution.


### 1. CLIENT LAYER

The client layer consists of the interfaces through which students, lecturers, and administrators interact with the system.

Mobile App (React Native):

Provides cross-platform support for iOS and Android. Students check in using BLE advertising, UUID broadcasting, or QR codes. The app also displays confirmation notifications, module schedules, and calendar integration.

On the lecturer perspective, the mobile application allows lecturers to view attendance reports, select lessons.

Both the students and lecturers are able to export reports as CSV files.

The administrators are able to create modules, users, assign roles and register ESP32 CYD devices to venues.

The interface overall is designed for usability, displaying all relevant features on a central dashboard.

The client layer is the first touchpoint for all user interactions, ensuring accessibility, responsiveness, and clarity of feedback.


### 2. IOT / DEVICE LAYER

The device layer bridges the physical classroom environment and the digital platform.

ESP32 CYD Devices: 
Generate unique QR codes for each lesson.

ESP32 CYD BLE Devices: 
Scan for nearby BLE UUIDs, and transmits data to the backend.

Local Storage (Offline Fallback): 
Devices store attendance logs temporarily if network connectivity is lost, ensuring reliability and continuity.

This layer guarantees accurate, real-time attendance capture while maintaining robustness against network failures.


### 3. COMMUNICATION LAYER

The communication layer handles data transmission between clients, devices, and backend services.

BLE and QR Protocols: 
Ensure secure, low-latency transfer of student identifiers from mobile devices to ESP32 CYD  hardware.

HTTPS: 
Encrypts all data in transit, protecting personal identifiers and attendance records against interception or tampering.

This layer establishes a secure, real-time, and reliable data flow, essential for trust and system integrity.


### 4. BACKEND / SERVICE LAYER

The backend layer is responsible for data processing, validation, and storage.

Azure-hosted API: 
Receives data from ESP32 CYD devices, validates clock-ins and clock-outs according to time, location, and device registration, and applies business logic for integrity.

Attendance Validation: 
Ensures students cannot falsify clock-ins and clock-outs and that anomalies are flagged for administrator review.

This layer enforces system rules, ensures consistency, and enables analytics for administrators and lecturers.


### 5. DATA / STORAGE LAYER

The storage layer provides secure and scalable data management.

Azure Table Storage: 
Stores attendance logs, device identifiers, timestamps, and user profiles.

Scalability: 
Horizontal scaling ensures that additional classrooms, students, or campuses can be accommodated without performance degradation.

The data layer ensures persistence, reliability, and accessibility of historical and real-time records.


### 6. CROSS-CUTTING CONCERNS

Security: 
Data encryption at rest (AES) and in transit (TLS 1.2+), role-based access control, and secure device registration.

Performance: 
Low-latency processing and near-instant confirmation for clock-ins.

Portability: 
Supports iOS, Android, and web platforms.

Reliability: 
Offline fallback and automated sync mechanisms maintain continuity.

Compliance: 
Adherence to POPIA and institutional policies for personal data handling.


### ARCHITECTURE OVERVIEW

The system follows a modular, service-oriented architecture (SOA) with clear separation of concerns. The client layer interacts seamlessly with IoT devices in the physical environment, which in turn communicate securely with backend APIs and storage services. This layered pattern ensures that each component—mobile app, device, backend, and database—can evolve independently while maintaining overall system integrity.

By combining IoT, mobile, and cloud technologies, AttndEase achieves a scalable, secure, and user-centric platform capable of accurate, real-time attendance tracking, transparent auditing, and efficient administrative reporting.


## Cloud

The cloud architecture of AttndEase leverages Microsoft Azure services to ensure scalability, reliability, security, and real-time responsiveness. Patterns are applied to manage data flow, storage, and service interactions while maintaining compliance and operational efficiency.


### 1. DATA STORAGE PATTERNS

Azure Table Storage – Repository Pattern

Attendance records, user accounts, and device registrations are stored in Azure Table Storage.

The Repository pattern abstracts data access, providing a consistent interface for the backend API to read, write, and query data.

This separation of data and logic simplifies maintainability and allows for future scalability as more classrooms or students are added.

Azure Blob Storage – Gateway Pattern

Multimedia content such as QR code images, timetable snapshots, and other large binary assets are stored in Azure Blob Storage.

The Gateway pattern acts as an interface between the backend and Blob Storage, encapsulating storage access logic.

This ensures that the backend remains decoupled from direct storage operations, enhancing flexibility and maintainability.


### 2. SERVICE INTEGRATION PATTERNS

Backend API – Service Layer Pattern

The API acts as a centralized service layer between ESP32 CYD devices, mobile apps, and storage services.

All clock-in data flows through this layer for validation, authentication, and persistence.

This pattern ensures separation of concerns, allowing the API to manage security, data integrity, and business rules independently of client or storage technologies.


### 3. SCALABILITY AND RELIABILITY PATTERNS

Elasticity – Horizontal Scaling Pattern

Azure Table Storage automatically scales horizontally to accommodate additional records without performance degradation.

Backend APIs deployed via Azure App Service can scale out to multiple instances during peak usage, supporting concurrent clock-ins across multiple classrooms or campuses.

Offline Fallback / Local Cache Pattern

ESP32 CYD  devices temporarily store clock-ins locally when network connectivity is unavailable.

Once the network is restored, cached data is synchronized with Azure Table Storage, ensuring reliability and continuity.


### 4. SECURITY AND COMPLIANCE PATTERNS

Role-Based Access Control (RBAC) Pattern

Azure App Service enforces role-based permissions, granting access to dashboards, storage, and APIs only to authorized users.

This ensures separation of responsibilities between students, lecturers, and administrators while maintaining compliance with POPIA.


### OVERALL CLOUD ARCHITECTURE PATTERN RATIONALE

The combination of these cloud patterns ensures that AttndEase achieves:

Scalability 
Table Storage and App Service scale with institutional size.

Reliability
Offline fallback and retry mechanisms prevent data loss.

Security
Proxy and RBAC patterns enforce encryption and access control.

Maintainability
Repository and Gateway patterns decouple storage from backend logic.

Responsiveness
Observer patterns deliver real-time updates to users and administrators.

By applying these patterns, the cloud architecture supports a secure, scalable, and user-centric attendance management system while maximizing efficiency and maintainability across all layers of the platform.


# SECURITY

Security is a critical aspect of AttndEase, ensuring that sensitive student, lecturer, and attendance data is protected at all times. Multiple layers of protection were implemented across the network, backend, mobile app, and IoT devices to prevent unauthorized access, data tampering, and system misuse.


## HOW NETWORKING WAS HANDLED

All network communications between mobile applications, ESP32 CYD devices, and the backend API are encrypted. Azure services were configured to enforce HTTPS connections exclusively. Additionally, firewall rules and network security groups were implemented to restrict access to backend endpoints, ensuring that only registered devices and authorized users can transmit data.


## HOW VULNERABILITIES WERE HANDLED


### Within the Backend Code

Error handling was carefully implemented to prevent information leakage and mitigate injection attacks.

Passwords and sensitive identifiers are hashed using secure algorithms before storage.

Input validation ensures that API requests conform to expected formats, preventing SQL/NoSQL injection and buffer overflow attacks.

Rate limiting and logging mechanisms were used to detect and prevent brute-force attempts.


### Within the ESP32 CYD Code

ESP32 CYD devices maintain unique session checks to prevent multiple scans from being recorded as duplicate clock-ins.

Communication with the API includes authentication tokens to ensure only valid devices send data.

Firmware validation and secure boot mechanisms were considered to prevent unauthorized device tampering.


### Within the Mobile App

Once a user completes clock-in, they are redirected to the dashboard to prevent duplicate submissions.

Local storage is encrypted to protect any cached identifiers.

Role-based access ensures students can only interact with their attendance data, while lecturers and administrators access privileged functions.


## HOW THREATS WERE HANDLED

Replay Attacks
All QR and BLE clock-ins include unique, time-limited tokens to prevent reuse.

Unauthorized Access
Multi-layer authentication (user login and device registration) ensures only authorized participants can clock in.

Data Integrity
Backend validation confirms timestamps, ESP32 CYD IDs, and user IDs match expected parameters before logging attendance.

Malware and Exploits
Mobile and backend applications were tested for vulnerabilities; dependencies and libraries were kept up to date.


## ADDITIONAL SECURITY MEASURES

Secure API keys and tokens for communication between ESP32 CYD  devices, mobile apps, and backend services.

Periodic security reviews and vulnerability scanning of backend APIs and mobile applications.

By implementing these measures, AttndEase ensures a secure, trustworthy, and reliable attendance management system. Students, lecturers, and administrators can interact with the system with confidence that data privacy, integrity, and availability are fully protected.


# DEVOPS

DevOps practices for AttndEase ensure the system is scalable, performant, secure, usable, and reliable throughout its lifecycle. Integration of cloud services, automated pipelines, monitoring, and testing guarantees that deployments are consistent, secure, and maintainable while supporting rapid iteration and high-quality user experiences.


### SCALABILITY IN DEVOPS

Load-balanced APIs
Azure Load Balancer distributes requests evenly across API instances, preventing bottlenecks and maintaining consistent response times.

Horizontal scaling for storage
Azure Table Storage supports dynamic partitioning, allowing rapid expansion as the number of students, devices, or classrooms increases.


### PERFORMANCE IN DEVOPS

Content Delivery Network (CDN)
If a web dashboard is deployed, static assets and dashboards are cached via Azure CDN to reduce latency for remote users.

Monitoring with Azure Application Insights
Tracks API latency, failed requests, and usage patterns to detect performance degradation.


### SECURITY IN DEVOPS

DevSecOps Pipelines
GitHub Actions or Azure DevOps pipelines enforce static security scanning (CodeQL), linting, unit tests, and vulnerability scans prior to deployment.


### USABILITY IN DEVSECOPS

UI Testing
React Native end-to-end tests (e.g., Detox) ensure the mobile app is intuitive and bug-free across Android and iOS devices.

Accessibility Testing
Colour contrast, font sizes, screen reader compatibility, and voice guidance are evaluated to ensure inclusivity.


### RELIABILITY IN DEVOPS

Redundant Storage
Azure Table Storage and Blob Storage would each have replicas to prevent data loss.

Retry Logic
Mobile application devices allow the user to tap again to scan the QR code for failed clock-in transmissions to ensure data consistency.

CI/CD Testing
Unit, integration, smoke, and chaos tests are included in pipelines to validate code, detect issues early, and ensure system stability under unexpected conditions.

By implementing these DevOps strategies, AttndEase achieves a robust operational environment that supports scalability, performance, security, usability, and reliability, ensuring seamless attendance management for students, lecturers, and administrators while maintaining high standards of compliance and maintainability.


# RUNNING COSTS


## MONTHLY COSTS OF RUNNING THE SYSTEM

Currently, the system has cost R0.00 to keep it running, as free plans were utilised in both the API Service and the storage account.


### Estimated Costs of all components:

1. ESP32 CYD  Development Boards (2 units)

The ESP32 CYD  is a versatile microcontroller with integrated Wi-Fi and Bluetooth capabilities, ideal for IoT projects.

Price Range per Unit: R154.95 to R188.00

Total for 2 Units: R309.90 to R376.00

Example Products:

ESP32 CYD  Development Board Wi-Fi with Bluetooth: R154.95

ESP32 CYD  Development Board Wi-Fi and Bluetooth: R188.00

2. 3D Printed Enclosure

A custom 3D printed enclosure is necessary to house the ESP32 CYD  and associated components.

Dimensions: Approximately the length of a phone and the width of a Bible, hollow inside.

Estimated Volume: Approximately 150 cm³ (assuming a compact design).

Material Cost: PLA filament costs around R400 per kg.

Printing Cost: R3 per cubic cm.

Estimated Total Cost:

Material Cost: R400/kg × 0.15 kg = R60

Printing Cost: R3/cm³ × 150 cm³ = R450

Total for 2 Units: R510

Note: Prices may vary based on design complexity and local service providers.

3. ESP32 CYD  with Integrated Screen

For projects requiring a display, an ESP32 CYD  board with an integrated screen is beneficial.

Price Range: R345.00 to R438.00

Example Product: ESP32 CYD  CYD - 2.8" with Resistive Touch

4. Wires and Connectors

Essential for connecting the ESP32 CYD  to peripherals and power sources.

Estimated Cost: R50 to R100

5. Batteries

For portable applications, a battery module is required.

Battery Module (750mAh): R205.00


### Total Estimated Cost (Excluding Shipping)

With ESP32 CYD  Boards with Integrated Screen it comes to roughly R1,469.90 to R1,576.00.


### Organisational running cost implementation

The client is able to choose to pay a Basic or Premium Plan for the Azure monthly costs. The Free Plan accumulates to R0.00 p/m, while the Basic Plan can reach costs up to R900.


# CHANGE MANAGEMENT

Change management for AttndEase ensures that both the organization and the users adopt the software seamlessly while maximizing efficiency, accuracy, and usability. Proper planning, demonstrations, and clear communication are key to successful implementation and long-term engagement.


### HOW AND WHY WILL THE ORGANIZATION ADOPT YOUR SOFTWARE?


#### How

The organization will adopt the system by mounting ESP32 CYD  devices on the walls of classrooms. All lecturers, students and administrators will be required to install the mobile application on their devices. A detailed demonstration presentation will be provided to staff members, explaining system operations, answering questions, and offering hands-on guidance. Training sessions will be supplemented with user manuals and quick start guides for both students and lecturers.


#### Why

The software provides a faster and more accurate method of tracking attendance, eliminating reliance on paper registers. Instances of forgery, such as friends signing in for others, are reduced due to unique BLE UUIDs and QR codes. ESP32 CYD  devices are cost-effective, scalable, and easy to deploy. Real-time logs reduce human error and fraud, while minimal wiring, Wi-Fi connectivity, and minimal maintenance requirements further enhance adoption. Automated reporting provides administrators with immediate access to attendance data.


### HOW AND WHY WILL THE USERS ADOPT YOUR SOFTWARE?


#### How

Users adopt the system by installing the app, logging in, and scanning QR codes to clock in and out. The process is simplified: a one-scan clock-in requires no typing, passwords, or card scanning. The system is faster than manual methods, supports both iOS and Android, and provides instant confirmation of attendance. Notifications indicate successful clock-ins or highlight errors, ensuring users remain informed.


#### Why

The software simplifies attendance tracking, reduces administrative burdens, and ensures a reliable record of participation. Students benefit from a faster, user-friendly, and error-free experience that is consistent across devices.


### STRATEGY TO GAIN ADOPTION FROM BOTH THE ORGANIZATION AND THE USERS

Pilot Testing
Deploy the system in a small class to demonstrate effectiveness and collect feedback for refinement.

Data-Driven Demonstrations
Present graphs and research highlighting the speed, accuracy, and reliability of the system.

For the Organization (Tertiary institution):

Provide lecturers with simplified attendance reports and dashboards.

Integrate the software with institutional policies, making it an official component of attendance procedures.

Offer ongoing technical support and training to ensure smooth adoption.

For Users (Students, lecturers, and administrators):

Conduct orientation demonstrations during lectures to showcase the speed and simplicity of clock-in.

Enable in-app pop-ups to provide immediate feedback on successful or failed attempts.

Support anonymous UUID-based attendance to simplify access and reduce login requirements.


### ADDITIONAL FEATURES FOR SMOOTH CHANGE MANAGEMENT

Support Channels
Offer chat or email support for troubleshooting.

Documentation
Provide clear step-by-step guides.

Monitoring & Reporting
Administrators receive alerts for anomalies or missing data to proactively address issues.

This change management approach ensures that both lecturers and students transition to AttndEase efficiently, creating a culture of trust, transparency, and technological adoption while enhancing attendance management processes.


# Conclusion

AttndEase demonstrates a comprehensive approach to modernizing attendance management by combining IoT, cloud computing, and mobile technologies. The system reduces human error, prevents fraudulent practices, and eliminates the inefficiencies of manual attendance methods. By leveraging ESP32 CYD devices, QR and BLE technology, React Native applications, and Azure cloud services, AttndEase ensures real-time, reliable, and secure attendance tracking.

The system is designed for scalability, portability, and usability, supporting diverse user groups while adhering to data privacy regulations such as POPIA. Change management strategies, including staff training, pilot testing, and clear user guidance, ensure smooth adoption and engagement. Real-time logs, automated notifications, and detailed reports empower administrators while providing transparency and reassurance to students.

Ultimately, AttndEase exemplifies a modern, efficient, and user-centric solution for attendance monitoring, fostering accountability, accuracy, and operational efficiency within educational institutions. It provides a foundation for future enhancements and broader adoption across multiple campuses, ensuring sustainable and effective attendance management.


# APPENDICES


## Scrum artifacts


### Evidence of KANBAN board

The above screenshots display the beginning of the Kanban board and the tasks that need to be completed, as well as the tasks currently underway.

This is the evidence of the Kanban board during the process of the system, as well as colour coordination being added to represent a team member’s task.

The above screenshots display the updated Kanban, with added tasks and updated column tasks.


### Evidence of Sprint planning

(Below are three minutes of meetings that were conducted during the course of this project.)


#### Minutes 1

Minutes of the First WIL Meeting

Date: 23 February 2025
Time: 17:00
Location: Microsoft Teams

1. Welcome

Kuhle welcomed everyone to the meeting.

2. Discussion on potential NGO contacts

Hlumelo will speak to his landlord’s co-worker about possible NGOs.

Kelly will ask her fiancé.

Kuhle and Aphiwe mentioned that both have uncles in the IT field who may provide insight.

3. Project Ideas and brainstorming

Each member presented their ideas, followed by a discussion. The following concepts were considered:

Proposed Project Ideas

Art Website (pitched by Kelly)

Website storefront and ‘Takealot’-style app version.

Incorporation of authentication.

Virtual Student Card (pitched by Kuhle)

Additional functionality for library access.

Integration of a QR scanner.

Potential future feature: Panic button (if time allows).

Sam Brown App (pitched by Aphiwe)

Login using a student card.

Unique order numbers generated for each order.

Users can check item availability in the cafeteria.

Wireless Phone Charging App (pitched by Aliziwe)

Idea modified to a Booking Power Bank App instead.

New Ideas Pitched

Notes Conversion App (pitched by Aliziwe)

Thief Detection App (pitched by Aliziwe)

Medical Booking System (pitched by Kelly)

4. Voting on Project Ideas

The team voted on the top four project ideas:

Virtual Student Card

Sam Brown App

Notes Conversion App

Medical Booking System

5. Election of Project Manager

Aliziwe was elected as Project Manager.

6. Other Key Discussions and decisions

It was requested that the next meeting be recorded.

More project ideas can still be pitched at the next meeting.

Each member will propose their desired roles at the next meeting.

7. Meeting Adjournment

Time: 19:14

8. Next Meeting Details

Date: Wednesday, 26 February 2025
Time: 12:00

Meeting Adjourned.


#### Minutes 2

MINUTES 11 APRIL 2025 – WIL MEETING 8

Apologies

Kelly

Research

HN: iOS Bluetooth is more complicated + stricter than Android. iOS may have more interference than Android. If app is in background, the receiving signals (pinging) is slower. iOS uses different android pairing. BLE to Wi-Fi, use Raspberry Pi for iOS signal sending.

GB: SQL would be easier because we are using relational tables. Should enquire with client (Jo) which tables are used for easier integration. An option would be to do a hybrid - SQL and NoSQL. Disadvantage is that it is not time efficient; and communicating between NoSQL and SQL; more services to maintain

KM: most viable option is using Azure. Advantage, credits given by school. Month to month payment process. The domain name is given by the Azure services. AWS would require additional research and therefore time. Must enquire which services are compatible to host API on school's server. The API is required to be hosted locally on schools' server. IP address must be public or public domain name to ensure accessibility from anyone. The disadvantage with domain name is the renewable every year. Domain name must have SSL or HTTPS for security. Similar API configuration to connection string.

AM: KMM splits the program into an android app and iOS app. Requirements- an IDE for iOS. Begin by writing android app in JVM, the plugin then converts code to Native/JavaScript/Desktop. Cannot have specific libraries for an OS but can have multiple libraries. You can choose which language to convert to. Disadvantage: need to install additional software (i.e. iOS-based software, emulator). The conversions happen through an API.

Chassis Design

All components are within the box. Suggestion for an insulation separator to prevent overheating; and a ventilation system (holes in box).

The box is approximately the size of a phone. 12X8X3 cm.

Request for working with another person on the chassis design.

Figma update

Safety measures to implement. I.e. AppLock for opening app/biometric verification for signing in/out

Additional queries

GB: Querying the database creation after Jo is satisfied with the Figma.

AM: researching KMP and chassis design

Creating GitHub repository

Next meeting

Tue, 15 April


#### Minutes 3

MINUTES 15/04/2025

Apologies - none given. Everyone present

Update on progress

Aphiwe - Chassis design

Requires physical material to build a demo chassis to visualize the spacing.

Components = Esp + RFID + Battery

Kelly will bring RFID for Aphiwe to figure out wiring

Kelly -

Registration model + Login model. Checks whether student logins in with their student card.

Needs the email address suffix of lecturers

No check on login - because there is already a vcconnect check on registration. Thus, will not give students access when logging in.

Will fix username when logging in. Currently own username. Must be email address

Password is automatically hashed (viewed in SQL database)

When logging in, must still validate he password and username when logging in.

Requirement that we have a database that is public that we (as a dev team) can develop and test.

Password validation is done automatically

Kuhle & Ali - CI/CD

Only create repos, workflows and automative testing.

Same as what we did last year.

He will still teach it to us next semester

George - Database creation

Kelly created it for her login/reg API

Hlumelo - BLE configuration

Still busy with the configuration.

Currently installing drivers

Note for Hlumelo and Kelly, when you want to upload, press the upload, then press and hold the boot button. Dots will begin loading. Once dots stop, let go of boot button. If that does not work, then the issue is most likely a driver issue.

Ali - QR code generation and reading

Needs string to generate code.

Output will be string format of QR Code

Must integrate with Kelly's Login API. Because it acts as another means of logging in.

Routing from QR Code o website = need more research

The QR code must generate a link that takes the user to the website

Tasks for next meeting

Need to have DB set-up in order to properly send and receive info to it.

Need to get API's:

Receiving the serial number of card that is linked to the student and checking that the student number is within db.

Assigned to Ali

Lecturer starting period - must be able to start lesson and add students into a lesson.

Assigned to George

Coding to receive continuous beacon signals + Log to record all students that have entered the classroom (pre-report).

Assigned to Kuhle

Students and lecturers must be able to clock in and out. RFID used

Ensure that students do not continuously tap and that crashes the system. -> Lecturer controls when the "clock in" and "clock out" period commences.

Table must auto-delete when the lesson has ended and report has been generated

Clock in will send straight to report and student report

Assigned to Aphiwe

BLE

Sending out signal(s) to user; send message to app confirming that student has successfully tapped into the class

Assigned to Hlumelo

Kotlin App

Tester Android that integrates the BLE into Kotlin.

Assigned to Kelly

Additional queries:

Request for an image of wiring - will videos of wiring. Helpful for putting the ESP in breadboard, the wiring remains the same. But NEED to switch the ESP around.

Request for picture of Kelly's DB. Code for DB is on git repo. Must create own connectionString

Ask Client

Public database for us to work on

Would vc like a public db/connected with WizeBooks?

Request meeting for Wed preferably, else Thur.

Ask Lecturer

How he got the android studio app on Jess's phone, wirelessly

Next meeting:  Thur, 24 April 2025

Meeting adjourned at 16:33


### Evidence of attendance roster

The following table highlights the percentage of attendances for each member during meetings


# How this system would have been implemented


## IMPLEMENTATION IN A CLASSROOM


### Preparation and site survey

A technical survey of the classroom is performed to identify mounting points, Wi-Fi signal strength, and power availability. This determines optimal ESP32 CYD placement and any network upgrades required. A clear site plan is created showing device locations and expected BLE/QR coverage areas.


### Device provisioning and registration

ESP32 CYD devices are flashed with the approved firmware and provisioned with unique device IDs. Each device is registered in the backend with a room mapping, ensuring clock-ins are associated with a physical location. Device certificates or API tokens are securely stored in Azure Key Vault.


### Physical installation

Devices are mounted at identified locations, typically near the front of the classroom at a height that captures screens and BLE broadcasts. Minimal wiring is used where power outlets exist; battery-backed options are installed where wiring is impractical. Devices are power-tested and rebooted to confirm operation.


### App distribution and account setup

Students, lecturers, and administrators install the React Native app from the institution’s distribution channel or respective app stores. Accounts are created or synchronized with the institutional directory. For anonymous UUID modes, the app generates device UUIDs without requiring full user login where policy permits.


### Pilot run and calibration

A pilot session is conducted with a single lecture. Devices and the app are monitored in real time. BLE scan intervals and QR decode distances are calibrated to avoid false positives while ensuring coverage. Time-window parameters for valid clock-ins are tuned to the schedule.


### Real-time monitoring and feedback

During the pilot, lecturers monitor attendances in the reports to confirm timestamps, ESP32 CYD IDs and user UUIDs match expected values. Students receive immediate confirmation pop-ups. Any anomalies are logged and triaged by the on-site technical lead.


### Acceptance and handover

Once pilot metrics show reliable detection rates and low false positives, the classroom is accepted. A handover document details ESP32 CYD IDs, mounting locations, and operational notes. Maintenance contacts and escalation procedures are provided to the department.


## ROLL-OUT ACROSS THE CAMPUS


### Phased deployment planning

Campus deployment is scheduled in phases by faculty or floor to reduce risk. Each phase contains a set of classrooms, support windows, and evaluation checkpoints. The plan includes spare device inventory and staging areas for pre-provisioning.


### Bulk provisioning and staging

Devices are provisioned in batches at a staging facility. Provisioning scripts apply device tokens, room mappings, and firmware updates automatically. Tagged inventory lists track serial numbers, assigned locations and installation dates.


### Field installation teams

Trained installation teams deploy devices following standard mounting and safety procedures. Each team performs sanity checks and registers their work into the central deployment tracker. A parallel support team handles immediate incidents.


### Campus-wide pilot and validation

After multiple classrooms and floors are installed, a campus-wide pilot is held for a representative sample of lectures. Aggregated data verifies system performance across variability in building materials, distances, and user behaviour. Adjustments to scan intervals or placement density are applied centrally.


### Operational governance and policy integration

University governance incorporates AttndEase into official attendance policies. Procedures specify acceptable clock-in windows, data retention rules, and academic usage. Legal and privacy teams confirm compliance with POPIA or other statutes.


### Full production cutover

Following successful phases, the system transitions to full production. A formal cutover plan addresses rollback criteria, notification schedules, and helpdesk readiness. Post-cutover monitoring remains intensive for at least one academic cycle.


## COVERAGE DEPLOYMENT (ENSURING PHYSICAL AND SERVICE COVERAGE)


### Coverage mapping

Heat maps are created for BLE and camera line-of-sight coverage. Overlapping coverage is used in irregular rooms. Areas requiring additional devices are identified and budgeted.


### Redundancy and failover

Critical lecture halls receive redundant devices to mitigate single-point failure. ESP32 CYD’s perform local logging in offline scenarios and synchronize once connectivity is restored. Backend APIs have failover instances to ensure availability.


### Performance baselines

Expected performance metrics are defined: average clock-in latency, acceptable miss-rate, and sync delay for offline logs. These baselines guide coverage decisions and SLA definitions for campus IT.


## USER TRAINING


### Staff orientation and technical workshops

Lecturers and administrators attend hands-on workshops that demonstrate dashboard usage, device registration, anomaly review, and export procedures. Workshops include a Q&A session and quick reference guides.


### Student onboarding and classroom demonstrations

Students receive in-class demonstrations, showing one-tap clock-in, QR fallback, and confirmation messages. Quick-start videos and step-by-step guides are provided. Orientation materials are integrated into first-week communications.


### Support materials and channels

A knowledge base includes FAQs, troubleshooting steps and escalation paths. Helpdesk channels include an email alias, ticketing portal, and a dedicated support phone line during initial roll-out weeks. On-site rovers provide immediate assistance for hardware issues.


### Ongoing training

Periodic refresher sessions and update notes accompany significant feature releases. Training for new academic staff is included in departmental onboarding.


## DATA MIGRATION


### Inventory of existing records

Existing attendance logs are audited to identify formats, identifiers, and retention policies. Mapping rules are defined to align legacy IDs with AttndEase UUIDs or institutional identifiers.


### Transformation and cleansing

Legacy data is transformed to match the schema of Azure Table Storage. Duplicate or corrupted entries are removed. Personally identifiable information is reviewed for compliance and redaction where required.


### Secure transfer and verification

Data migration scripts push cleansed records into a staging table. Verification jobs compare record counts, timestamps, and sample entries to ensure fidelity. Migration occurs over secure channels and is logged for auditability.


### Cutover and archival

Once verification is complete, a final delta migration syncs recent entries. Legacy systems are archived according to institutional policy. A rollback plan ensures data can be reverted if inconsistencies arise post-migration.


## SYSTEM TESTING


### Unit and component testing

Backend APIs, mobile modules and device firmware are unit-tested to ensure individual components meet functional specifications. Test suites run automatically in CI pipelines.


### Integration testing

End-to-end tests simulate BLE broadcasts and QR scans, device transmissions, API validation, and database writes. These tests validate business rules such as time windows and device-room mappings.


### Device field testing

ESP32 CYD  devices are field-tested in representative rooms to measure detection ranges, false positive rates, and camera decoding reliability in varied lighting conditions.


### Performance testing

Load tests simulate peak clock-in volumes across the campus. Backend scaling and Table Storage partitioning are validated under stress to ensure latency targets are met.


### Security and compliance testing

Penetration tests and vulnerability scans are conducted against APIs and mobile apps. Encryption at rest and transit is validated. Logs are audited to confirm adherence to POPIA requirements.


### User acceptance testing (UAT)

Stakeholders including lecturers and departmental administrators perform UAT sessions to confirm that the system meets practical needs. Feedback is recorded and prioritized.


### Pilot acceptance criteria

Clear acceptance thresholds define success: detection accuracy above agreed percentage, clock-in latency within seconds, and no critical security findings. Pilot sign-off authorizes wider deployment.


### Regression and release testing

Each release undergoes regression tests to ensure new features do not break existing functionality. Automated smoke tests run post-deployment to staging and production.


## SUPPORT, MAINTENANCE AND CONTINUOUS IMPROVEMENT


### Monitoring and alerting

Dashboards monitor device health, API errors, and sync backlogs. Alerts notify support teams when thresholds are breached.


### Scheduled maintenance

Firmware updates and backend patches are scheduled during low-usage windows. Change windows are communicated to stakeholders in advance.


### Feedback loops

User feedback is collected through in-app forms and support tickets. Iterative improvements are prioritized by impact and feasibility.

Initial classroom implementation follows a strict sequence: site survey, device provisioning, installation, app distribution, pilot calibration, and acceptance. Campus-wide deployment is phased, with robust staging, network readiness, and governance integration. Coverage planning ensures consistent service while redundancy and offline sync protect against failure. Training programs equip staff and students to use the system confidently. Data migration is handled securely and verified before cutover. Rigorous testing—unit, integration, field, performance, and security—validates readiness prior to expansion. Post-deployment monitoring, support and iterative improvements sustain reliability and user trust.

This implementation approach balances operational practicality with technical rigor, ensuring that AttndEase delivers accurate, transparent, and scalable attendance management across classrooms and the entire campus.


# Overview of SPRINTS


## Sprint 1 – Team Formation and initial planning

The team has been formed. The group members and team role are defined as follows:

Kelly Botha

Aliziwe Qeqe

George Bekker

Kuhle Mlinganiso

Aphiwe Mhotwana

Hlumelo Ntwanambi

Various group project suggestions were made These include:

A local art shop store front web application

Backpack security theft face-recognition detection

Final agreement was made for an attendance tracker for students within a classroom.

Communication tools that were set up include Microsoft Teams and a WhatsApp Group.


## Sprint 2 – Requirements Gathering


### Functional Requirements for WIL

App

Registering

Both students and lecturers are required to register into app

Can either scan with QR code on student card or manually enter fields

Student

Must enter ST number, name, surname, qualification, year, list of modules (to choose from), email address

Lecturer

Must enter lecturer id, name, surname, qualification, list of modules (to choose from, email address)

Must verify with email address where a confirmation email will be sent once registered

Logging in

Both lecturers and students are required to log into app

Report generation/analysis

Lecturers get given a report after every lesson.

Columns are labelled as ‘Late,’ ‘Present’ and ‘Absent’

Must be able to filter through ‘Late,’ ‘Present’ and ‘Absent’ students

Lecturers are able to manually override the attendance generated.

The report analysis must explain the overriding and specify why the lecturer changed the attendance of the student

Provide comment area/drop down menu with reason options

Can be able to view current attendance percentage of each student within each module.

Must be downloadable

Progress report generation

Students are provided with a progress report list of all modules they attended thus far

Must be downloadable

Non-android users

Lecturer must be able to generate a QR code for students to connect to and thus ‘log in.’

QR code must be unique after every generation and must expire after a set time. E.g. 10mins

Website version of the app must be created

Lecturer responsibilities

Upon logging in, lecturer must select which module they are currently in.

Date and time for that module must populate automatically

Additional features:

Students should be able to access their specific timetable. Or students can create their own timetable via calendar and are then able to update the calendar

Personalized notifications sent to students to attend class when they have missed more than x number of classes.

Backend

BLE must send signals every 30 mins to apps

BLE signals will begin at set times according to calendar:

08:20

10:20

13:00

15:00

BLE signals will stop at:

10:10

12:00

14:50

16:40

A ‘Lecturing Period’ will be created by the clocking in (tapping in) of the lecturer.

If lecturer comes in late, and the module has already begun the students will be added to a ‘waiting room.’

Once the lecturer clocks in, the students are retrieved from ‘waiting room’ and populated onto the attendance list

Both lecturers and students are required to clock out (tap out) when the lesson is over

Student number, Module Code and Venue must each have a tag

Hardware

Each beacon must have a tag id, and be defined to a location (classroom)

3D print chassis

Frontend

Dashboard

Image of student card will be displayed

Colour schemes

Be similar to arc’s – blue/navy, orange, and pink. But predominantly white.


## Sprint 3 – Domain Analysis and Design

See  for the Domain modelling diagram


## Sprint 4 – Project Structure and Initial Implementation

DevOps was implemented into the react native application. The CI/CD pipeline ensures that the code that is pushed into main does not crash, and an APK file is generated from the main branch in GitHub.


## Sprint 5 – Core Feature Implementation

There were many setbacks with the implementation of the core features, as initially the goal was to have the students tap their phones near an RFID, and that would scan the user in; however, the serial number of the phone changes all the time, so it was not possible to store a permanent address to one user.

The next plan of action involved students having a QR code that would be generated on their phones, and scanned with an ESP device; however, the ESP-32 Cam became corrupted, and it was unable to stream photo or video image. Thus, this course of action was needed to be changed.

The final course of action was to use an ESP screen whereby a QR code is generated, and the students are able to scan the QR code using their apps on the phone. Because of the major setbacks resulting from the trial and error, core implementation happened much later down the expected timeline.

As well as the hardware configuration issues, the app side also posed many problems. The initial plan was to use Android Studio, however, our client informed us that the application needed to be accessible to both iOS and Android users – PWA was then suggested, however, the issue then was that RFID could not be scanned the way the system was designed. Finally, React Native was settled upon, and the application was developed on react native instead.


## Sprint 6 – Integration and Testing

Initial testing uncovered that phones were unable to be recognised by the RFID due to change in serial number.

ESP-32 Cam testing uncovered that the camera was no longer able to detect images due to it becoming corrupted.

Final testing concluded in the running, however since security features had been implemented, it was difficult to do testing whenever, as lessons could not be scheduled during the weekend or after certain hours, so testing was confined to weekdays only.


## Sprint 7 – Secondary Feature Implementation

Secondary features such as the calendar feature for both students and lecturers, GUI, etc. was implemented before the core features were implemented, because the application side was the only concrete element of the system that wouldn’t change, and in order to utilise the time wisely, the app side was completed much sooner.


## Sprint 8 – Security and DevOps

DevSecOps was implemented initially upon the initial set-up of the react native application. It was later refined to incorporate CircleCi and Sonar for increased security protection.


## Sprint 9 – Performance and scalability Enhancements


### Performance

Performance defines responsiveness, throughput, and system efficiency. The platform must ensure minimal latency between clock-in actions and confirmation responses.

Students should receive real-time acknowledgment of their attendance clock-in, typically within seconds, to reduce uncertainty. Lecturers accessing dashboards should experience near-instantaneous log retrieval, even when filtering across weeks of data.

Backend services must be optimized to handle peak loads, such as multiple classes beginning at the same hour, without timeouts or degraded user experience. Consistent system responsiveness is therefore a key performance criterion.


### Scalability

Scalability was implemented throughout the process, to ensure that there would be no need to alter code in order for the application and system to be scalable. Azure Tables and Blob Storage was utilised to ensure scalability of the system.


## Sprint 10 – User acceptance testing and bug fixing

User acceptance testing was not approved by the client due to the system not being completed at the time of presenting.


# REFERENCES


### ESP32 CYD

timwoo, 2017. ESP32 CYD BLE + Android + Arduino IDE = AWESOME. [online] Instructables. Available at: <https://www.instructables.com/ESP32%20CYD%20-BLE-Android-App-Arduino-IDE-AWESOME/> [Accessed 4 November 2025].

AltBeacon, 2025. Android Beacon Library. [online] altbeacon.github.io. Available at: <> [Accessed 3 November 2025].

ESPresense, 2024. Home. [online] ESPresense. Available at: <> [Accessed 4 November 2025].

Espressif, 2016. BLE — Arduino ESP32 CYD latest documentation. [online] Espressif.com. Available at: <https://docs.espressif.com/projects/arduino-ESP32%20CYD/en/latest/api/ble.html> [Accessed 4 November 2025].

innoveit, 2025. innoveit/react-native-ble-manager: React Native BLE communication module. [online] GitHub. Available at: <> [Accessed 4 November 2025].

Leuliette, D., 2024. How to read/write data with BLE and react-native-ble-plx? [online] Stack Overflow. Available at: <> [Accessed 4 November 2025].

Random Nerd Tutorials, 2025. ESP32 CYD with MFRC522 RFID Reader/Writer (Arduino IDE). [online] Random Nerd Tutorials. Available at: <https://randomnerdtutorials.com/ESP32%20CYD-mfrc522-rfid-reader-arduino/> [Accessed 4 November 2025].

Spiess, A., 2025. #173 ESP32 CYD Bluetooth BLE with Arduino IDE (Tutorial) and Polar H7. [online] YouTube. Available at: <> [Accessed 4 November 2025].

user1048175, 2013. IBeacon / Bluetooth Low Energy (BLE devices) - Maximum Number of Beacons. [online] Stack Overflow. Available at: <> [Accessed 4 November 2025].

Varun Kukade, 2024. Part 1: Bluetooth Low Energy (BLE) in React Native. [online] Medium. Available at: <> [Accessed 4 November 2025].


### QR Code

Anon., 2021. QR Codes - Working, Usage, Pros & Cons | SecurePass. [online] SecurePass. Available at: <> [Accessed 4 November 2025].

Balevic, K., 2024. Gavin Newsom used a QR code to announce his decision to sign a bill. [online] Business Insider. Available at: <?> [Accessed 4 November 2025].

Government of South Africa, n.d. Register a patent | South African Government. [online] gov.za. Available at: <> [Accessed 4 November 2025].

Matic, Q.C., 2024. Advantages and Disadvantages of QR Codes. [online] QR Code Matic. Available at: <> [Accessed 4 November 2025].

Seruwagi, G., n.d. Understanding intellectual property rights in South Africa. [online] Gawie le Roux | Institute of Law. Available at: <> [Accessed 4 November 2025].

Shubhi, 2016. Advantages of QR Code: A list of 6 real reasons to use them. [online] Scanova. Available at: <> [Accessed 4 November 2025].

Smit, S. and Van Wyk, S., 2021. South Africa. [online] Smit & Van Wyk. Available at: <> [Accessed 4 November 2025].


### APIS

Ramotion, 2025. A Step-By-Step Guide to Install NPM for Beginners | Ramotion Agency. [online] Ramotion.com. Available at: <> [Accessed 4 November 2025].

Azure Blob Storage, 2025. Azure Blob Storage. [online] Dapr Docs. Available at: <> [Accessed 4 November 2025].

Bhatt, R., 2023. Generate QR Code Using C# Console Application. [online] C-Sharpcorner.com. Available at: <> [Accessed 4 November 2025].

Budziński, M., 2024. What Is React Native? Complex Guide for 2021. [online] Netguru.com. Available at: <> [Accessed 4 November 2025].

Amos, G., n.d. Building Your First Android and iOS App with React Native CLI. [online] Getstream.io. Available at: <> [Accessed 4 November 2025].

Jindal, V., 2024. CRUD Operations in Azure Table Storage Using C#. [online] Medium. Available at: <> [Accessed 4 November 2025].


### React Native

React, 2024. Quick Start. [online] react.dev. Available at: <> [Accessed 4 November 2025].

React Native, n.d. Introduction · React Native. [online] reactnative.dev. Available at: <> [Accessed 4 November 2025].

YouTube, n.d. React Native Tutorial for Beginners - Build a React Native App. [online] Available at: <> [Accessed 4 November 2025].

npm, 2022. @mikezzb/react-native-timetable. [online] npmjs.com. Available at: <> [Accessed 4 November 2025].

Code Step By Step, 2023. React Native tutorial #46 API Call | Fetch Rest API. [online] YouTube. Available at: <> [Accessed 4 November 2025].

App Stack Engineer, 2024. React Native API Calls Tutorial: GET, POST, PUT, DELETE | REST API Guide with Fetch. [online] YouTube. Available at: <> [Accessed 4 November 2025].

Bansi Khokhani, 2024. To Write Data to an Excel File and Download it into the Local Directory in React-Native. [online] Medium. Available at: <> [Accessed 4 November 2025].

Indently, 2021. QR & Barcode Scanner App Tutorial in React Native. [online] YouTube. Available at: <> [Accessed 20 October 2025].


### 3D Model

Lough, B., 2025. Cheap and Easy to Use ESP32 CYD Screen! [online] YouTube. Available at: <> [Accessed 4 November 2025].

LVGL, 2021. All Widgets - LVGL 9.4 Documentation. [online] lvgl.io. Available at: <> [Accessed 19 October 2025].

Octet, 2024. Mobile Navigation Design: Top 10 Example & Guide for App Design. [online] Octet Design Journal. Available at: <> [Accessed 8 March 2025].

pixeledi Tech Hub, 2025. Setting up CYD & using LVGL – GUI with Arduino and ESP32 CYD. [online] YouTube. Available at: <https://www.youtube.com/watch?v=FneWsC1clhc&amp;t=529s> [Accessed 19 October 2025].

PixelEDI, 2025. LVGL_ESP32 CYD_YT-Beispiele/02_lvgl_button_eventhandler at Main · pixelEDI/LVGL_ESP32 CYD_YT-Beispiele. [online] GitHub. Available at: <https://github.com/pixelEDI/LVGL_ESP32%20CYD_YT-Beispiele/tree/main/02_lvgl_button_eventhandler> [Accessed 19 October 2025].

tz1, 2025. tz1/qrduino: QR codes (2D barcodes) for Arduino and embedded. [online] GitHub. Available at: <> [Accessed 4 November 2025].

Ward, J., 2022. Reach Studios. [online] Reach Studios. Available at: <.> [Accessed 8 March 2025].

yoprogramo, 2023. yoprogramo/QRcodeDisplay: ESP Generate QRCode for Several Displays - Base Repo. [online] GitHub. Available at: <> [Accessed 4 November 2025].
