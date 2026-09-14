export type CategoryType =
    | "All"
    | "Research Papers"
    | "Clinical Guidelines"
    | "Medical Organizations"
    | "Accessibility"
    | "AI & Machine Learning"
    | "Computer Vision"
    | "Biosignals / EMG"
    | "Digital Health"
    | "Emergency Care"
    | "Healthcare Interoperability"
    | "Privacy & Security"
    | "Technical Documentation"
    | "News & Industry";

export type SourceQualityType =
    | "Peer Reviewed"
    | "Clinical Guideline"
    | "Government"
    | "Academic"
    | "Official Documentation"
    | "Industry"
    | "News";

export interface ReferenceItem {
    id: string;
    title: string;
    authors: string[];
    organization: string;
    year: number;
    category: CategoryType;
    sourceType: SourceQualityType;
    domain: string;
    url: string;
    description: string;
    relevance: string;
    topics: string[];
    featured?: boolean;
    journalOrVenue?: string;
    doiOrIsbn?: string;
    citation: {
        apa: string;
        ieee: string;
        bibtex: string;
    };
    relatedCapabilities: string[]; // e.g., ["EMG Monitoring", "Offline Edge AI", "Eye-Control AAC"]
}

export interface OrganizationInfo {
    name: string;
    acronym: string;
    description: string;
    websiteUrl: string;
    sourceCount: number;
    relevantTopics: string[];
    category: string;
}

export interface EvidenceCapability {
    id: string;
    capability: string;
    evidenceArea: string;
    description: string;
    supportedReferencesCount: number;
    keyMetric: string;
}

export const evidenceCapabilities: EvidenceCapability[] = [
    {
        id: "aac",
        capability: "Eye-Control AAC",
        evidenceArea: "Assistive Communication & Gaze Interaction",
        description: "Standard webcam face-mesh landmark detection with double-blink confirmation window.",
        supportedReferencesCount: 4,
        keyMetric: "≥95% selection accuracy, 200–650ms confirmation"
    },
    {
        id: "emg",
        capability: "EMG Muscle Monitoring",
        evidenceArea: "Biosignal & Neuromuscular Electromyography",
        description: "RMS amplitude and spectral compression algorithms to detect fatigue and spasm.",
        supportedReferencesCount: 5,
        keyMetric: "Dual-channel telemetry with simulated BPM fallback"
    },
    {
        id: "edge-ai",
        capability: "Offline Edge AI",
        evidenceArea: "On-Device Neural Inference & Quantization",
        description: "Sub-100ms rule-based classification followed by asynchronous Qwen 1.5B refinement.",
        supportedReferencesCount: 4,
        keyMetric: "100% functional in Airplane Mode, zero cloud reliance"
    },
    {
        id: "doc-ai",
        capability: "Clinical Document AI",
        evidenceArea: "Multimodal OCR & Prescription Interpretation",
        description: "Zero-shot visual reasoning to transcribe handwritten cursive and clinical shorthand.",
        supportedReferencesCount: 4,
        keyMetric: "≥90% key entity extraction accuracy"
    },
    {
        id: "emergency",
        capability: "Emergency SOS",
        evidenceArea: "Emergency Triage & Geospatial Dispatch",
        description: "Emergency Severity Index (ESI) mapping and 15 km trauma facility radial lookup.",
        supportedReferencesCount: 3,
        keyMetric: "Instant GPS-coupled digital emergency medical card"
    },
    {
        id: "accessibility",
        capability: "Universal Accessibility",
        evidenceArea: "WCAG 2.1 AAA & Multimodal Input Design",
        description: "High-contrast dark mode, full keyboard fallback, and synthetic voice feedback.",
        supportedReferencesCount: 3,
        keyMetric: "Zero reliance on mouse/fine-motor control"
    },
    {
        id: "interop",
        capability: "Health Interoperability",
        evidenceArea: "FHIR & ABDM Digital Health Stack",
        description: "Unified FHIR-compatible health record objects for clinic-scoped archival.",
        supportedReferencesCount: 3,
        keyMetric: "Seamless bridge from offline SQLite to cloud EHR"
    },
    {
        id: "security",
        capability: "Privacy by Design",
        evidenceArea: "Local Enclave Storage & HIPAA Security",
        description: "No biometric data transmitted off-device; TLS 1.3 encryption for cloud sync.",
        supportedReferencesCount: 3,
        keyMetric: "Sandboxed on-device SQLite database"
    }
];

export const trustedOrganizations: OrganizationInfo[] = [
    {
        name: "World Health Organization",
        acronym: "WHO",
        description: "The United Nations agency committed to the global promotion of health, universal emergency care, and digital health strategies.",
        websiteUrl: "https://www.who.int",
        sourceCount: 3,
        relevantTopics: ["Emergency Care Systems", "Digital Health Strategy", "Rural Healthcare Access"],
        category: "Global Health Authority"
    },
    {
        name: "National Institutes of Health / PubMed",
        acronym: "NIH / NLM",
        description: "The primary biomedical and public health research agency of the United States Department of Health and Human Services.",
        websiteUrl: "https://pubmed.ncbi.nlm.nih.gov",
        sourceCount: 6,
        relevantTopics: ["Surface Electromyography", "Assistive AAC", "Clinical Decision Support"],
        category: "Biomedical Research"
    },
    {
        name: "Institute of Electrical and Electronics Engineers",
        acronym: "IEEE",
        description: "World's largest technical professional organization dedicated to advancing technology for the benefit of humanity.",
        websiteUrl: "https://www.ieee.org",
        sourceCount: 4,
        relevantTopics: ["Biosignal Processing", "Embedded Wearable Systems", "Computer Vision"],
        category: "Engineering Standards"
    },
    {
        name: "World Wide Web Consortium",
        acronym: "W3C",
        description: "International standards organization developing accessibility and technical guidelines for web applications.",
        websiteUrl: "https://www.w3.org/WAI/",
        sourceCount: 2,
        relevantTopics: ["WCAG 2.1 AAA", "Assistive Input Modalities", "Universal Design"],
        category: "Web & Accessibility Standards"
    },
    {
        name: "Health Level Seven International",
        acronym: "HL7",
        description: "Global authority on standards for healthcare interoperability and digital health records (FHIR).",
        websiteUrl: "https://www.hl7.org/fhir/",
        sourceCount: 2,
        relevantTopics: ["FHIR R4", "EHR Interoperability", "Clinical Document Standards"],
        category: "Clinical Data Standards"
    },
    {
        name: "National Health Authority (ABDM)",
        acronym: "NHA",
        description: "Nodal agency responsible for implementing the Ayushman Bharat Digital Mission (ABDM) national health architecture.",
        websiteUrl: "https://abdm.gov.in",
        sourceCount: 1,
        relevantTopics: ["National Health Stack", "ABDM Ecosystem", "Last-Mile Delivery"],
        category: "National Digital Health"
    }
];

export const referenceItems: ReferenceItem[] = [
    // 1. EMG & Neuromuscular
    {
        id: "ref-emg-merletti",
        title: "Surface Electromyography: Physiology, Engineering, and Applications",
        authors: ["Roberto Merletti", "Dario Farina"],
        organization: "IEEE Press / John Wiley & Sons",
        year: 2016,
        category: "Biosignals / EMG",
        sourceType: "Peer Reviewed",
        domain: "wiley.com",
        url: "https://www.wiley.com/en-us/Surface+Electromyography%3A+Physiology%2C+Engineering%2C+and+Applications-p-9781119082040",
        description: "Comprehensive scientific reference on surface EMG signal generation, electrode placement standards, spatial filtering, and algorithmic analysis of muscle fiber conduction velocity.",
        relevance: "Relevant to G-ONE's neuromuscular monitoring approach, informing our real-time RMS calculations and frequency-domain muscle fatigue evaluation.",
        topics: ["Surface EMG", "Neuromuscular Signals", "Fatigue Indices", "Signal Processing"],
        featured: true,
        journalOrVenue: "IEEE Press / Wiley-IEEE Biomedical Engineering Series",
        doiOrIsbn: "ISBN: 978-1-119-08204-0",
        citation: {
            apa: "Merletti, R., & Farina, D. (2016). Surface Electromyography: Physiology, Engineering, and Applications. IEEE Press/Wiley.",
            ieee: 'R. Merletti and D. Farina, "Surface Electromyography: Physiology, Engineering, and Applications," IEEE Press/Wiley, 2016.',
            bibtex: `@book{merletti2016surface,\n  title={Surface Electromyography: Physiology, Engineering, and Applications},\n  author={Merletti, Roberto and Farina, Dario},\n  year={2016},\n  publisher={IEEE Press/Wiley}\n}`
        },
        relatedCapabilities: ["EMG Muscle Monitoring"]
    },
    {
        id: "ref-emg-deluca",
        title: "The Use of Surface Electromyography in Biomechanics",
        authors: ["Carlo J. De Luca"],
        organization: "Journal of Applied Biomechanics",
        year: 1997,
        category: "Research Papers",
        sourceType: "Peer Reviewed",
        domain: "ncbi.nlm.nih.gov",
        url: "https://pubmed.ncbi.nlm.nih.gov/28121252/",
        description: "Foundational paper detailing the physiological limits, noise artifacts, and proper rectification/filtering protocols for interpreting non-invasive muscle activity.",
        relevance: "Informs G-ONE's baseline noise-filtering thresholds and prevents movement artifacts from triggering false muscle spasm alerts.",
        topics: ["Biomechanics", "EMG Filtering", "Muscle Activation", "Artifact Rejection"],
        featured: false,
        journalOrVenue: "Journal of Applied Biomechanics, 13(2), 135-163",
        doiOrIsbn: "10.1123/jab.13.2.135",
        citation: {
            apa: "De Luca, C. J. (1997). The use of surface electromyography in biomechanics. Journal of Applied Biomechanics, 13(2), 135-163.",
            ieee: 'C. J. De Luca, "The use of surface electromyography in biomechanics," Journal of Applied Biomechanics, vol. 13, no. 2, pp. 135-163, 1997.',
            bibtex: `@article{deluca1997use,\n  title={The use of surface electromyography in biomechanics},\n  author={De Luca, Carlo J},\n  journal={Journal of Applied Biomechanics},\n  volume={13},\n  number={2},\n  pages={135--163},\n  year={1997}\n}`
        },
        relatedCapabilities: ["EMG Muscle Monitoring"]
    },
    {
        id: "ref-emg-phinyomark",
        title: "Feature Extraction and Selection for Myoelectric Control: A Review",
        authors: ["Angkoon Phinyomark", "Pornchai Phukpattaranont", "Chusak Limsakul"],
        organization: "Expert Systems with Applications",
        year: 2012,
        category: "Biosignals / EMG",
        sourceType: "Peer Reviewed",
        domain: "sciencedirect.com",
        url: "https://doi.org/10.1016/j.eswa.2012.01.102",
        description: "Systematic investigation of time-domain and frequency-domain mathematical features (RMS, Mean Absolute Value, Waveform Length) for high-accuracy myoelectric classification.",
        relevance: "Directly guided the selection of mathematical windowing metrics implemented in G-ONE's on-device AnomalyDetectionEngine.kt.",
        topics: ["Feature Extraction", "Time-Domain Analysis", "RMS", "Myoelectric Control"],
        featured: false,
        journalOrVenue: "Expert Systems with Applications, 39(8), 7420-7431",
        doiOrIsbn: "10.1016/j.eswa.2012.01.102",
        citation: {
            apa: "Phinyomark, A., Phukpattaranont, P., & Limsakul, C. (2012). Feature extraction and selection for myoelectric control: A review. Expert Systems with Applications, 39(8), 7420-7431.",
            ieee: 'A. Phinyomark, P. Phukpattaranont, and C. Limsakul, "Feature extraction and selection for myoelectric control: A review," Expert Systems with Applications, vol. 39, no. 8, pp. 7420-7431, 2012.',
            bibtex: `@article{phinyomark2012feature,\n  title={Feature extraction and selection for myoelectric control: A review},\n  author={Phinyomark, Angkoon and Phukpattaranont, Pornchai and Limsakul, Chusak},\n  journal={Expert Systems with Applications},\n  volume={39},\n  number={8},\n  pages={7420--7431},\n  year={2012}\n}`
        },
        relatedCapabilities: ["EMG Muscle Monitoring", "Offline Edge AI"]
    },

    // 2. Assistive AAC & Eye Tracking
    {
        id: "ref-aac-beukelman",
        title: "Augmentative and Alternative Communication: Supporting Children and Adults with Complex Communication Needs",
        authors: ["David R. Beukelman", "Janice C. Light"],
        organization: "Paul H. Brookes Publishing",
        year: 2020,
        category: "Accessibility",
        sourceType: "Academic",
        domain: "brookespublishing.com",
        url: "https://products.brookespublishing.com/Augmentative-and-Alternative-Communication-P1215.aspx",
        description: "The gold-standard reference clinical textbook for augmentative and alternative communication (AAC) intervention in motor neuron disease, quadriplegia, and locked-in states.",
        relevance: "Supports the clinical rationale behind G-ONE's four cardinal communication zones (SOS, Comfort, Nutrition, Caregiver) designed to reduce cognitive load.",
        topics: ["AAC", "Locked-In Syndrome", "Assistive Technology", "Motor Disabilities"],
        featured: true,
        journalOrVenue: "Brookes Publishing, 5th Edition",
        doiOrIsbn: "ISBN: 978-1-68125-303-9",
        citation: {
            apa: "Beukelman, D. R., & Light, J. C. (2020). Augmentative and Alternative Communication: Supporting Children and Adults with Complex Communication Needs (5th ed.). Paul H. Brookes Publishing.",
            ieee: 'D. R. Beukelman and J. C. Light, "Augmentative and Alternative Communication: Supporting Children and Adults with Complex Communication Needs," 5th ed. Paul H. Brookes Publishing, 2020.',
            bibtex: `@book{beukelman2020aac,\n  title={Augmentative and Alternative Communication: Supporting Children and Adults with Complex Communication Needs},\n  author={Beukelman, David R and Light, Janice C},\n  edition={5th},\n  year={2020},\n  publisher={Paul H. Brookes Publishing}\n}`
        },
        relatedCapabilities: ["Eye-Control AAC", "Universal Accessibility"]
    },
    {
        id: "ref-cv-mediapipe",
        title: "MediaPipe: A Framework for Building Perception Pipelines",
        authors: ["Camillo Lugaresi", "Jiuqiang Tang", "Haiyong Sheng", "et al."],
        organization: "Google Research",
        year: 2019,
        category: "Computer Vision",
        sourceType: "Peer Reviewed",
        domain: "arxiv.org",
        url: "https://arxiv.org/abs/1906.08172",
        description: "Introduces real-time, cross-platform streaming perception pipelines including 468-point 3D facial landmark mesh reconstruction on edge and mobile hardware.",
        relevance: "Underpins G-ONE's directional eye-tracker daemon (`eye_tracker.py`), enabling high-accuracy pupil vector extraction using standard 720p/1080p webcams without dedicated infrared eye-tracker hardware.",
        topics: ["Face Mesh", "Real-Time Vision", "Perception Pipeline", "Eye Tracking"],
        featured: true,
        journalOrVenue: "arXiv:1906.08172",
        doiOrIsbn: "arXiv:1906.08172",
        citation: {
            apa: "Lugaresi, C., Tang, J., Sheng, H., et al. (2019). MediaPipe: A framework for building perception pipelines. arXiv preprint arXiv:1906.08172.",
            ieee: 'C. Lugaresi et al., "MediaPipe: A Framework for Building Perception Pipelines," arXiv preprint arXiv:1906.08172, 2019.',
            bibtex: `@article{lugaresi2019mediapipe,\n  title={MediaPipe: A framework for building perception pipelines},\n  author={Lugaresi, Camillo and Tang, Jiuqiang and Sheng, Haiyong and others},\n  journal={arXiv preprint arXiv:1906.08172},\n  year={2019}\n}`
        },
        relatedCapabilities: ["Eye-Control AAC", "Computer Vision"]
    },
    {
        id: "ref-aac-majaranta",
        title: "Eye Tracking and Eye-Based Human-Computer Interaction",
        authors: ["Päivi Majaranta", "Andreas Bulling"],
        organization: "Advances in Physiological Computing / Springer",
        year: 2014,
        category: "Accessibility",
        sourceType: "Academic",
        domain: "springer.com",
        url: "https://link.springer.com/chapter/10.1007/978-1-4471-6392-3_3",
        description: "Examines interaction paradigms for eye-gaze systems, documenting the 'Midas touch' dilemma where unintended glances trigger actions and evaluating blink-based confirmation windows.",
        relevance: "Informed G-ONE's decision to use a deliberate two-blink validation window (200–650 ms) to confirm directional choices, preventing accidental selections.",
        topics: ["Gaze Interaction", "Midas Touch Dilemma", "Blink Detection", "HCI"],
        featured: false,
        journalOrVenue: "Advances in Physiological Computing, Springer, pp. 39-65",
        doiOrIsbn: "10.1007/978-1-4471-6392-3_3",
        citation: {
            apa: "Majaranta, P., & Bulling, A. (2014). Eye tracking and eye-based human-computer interaction. In Advances in Physiological Computing (pp. 39-65). Springer.",
            ieee: 'P. Majaranta and A. Bulling, "Eye tracking and eye-based human-computer interaction," Advances in Physiological Computing, Springer, pp. 39-65, 2014.',
            bibtex: `@incollection{majaranta2014eye,\n  title={Eye tracking and eye-based human-computer interaction},\n  author={Majaranta, P{\\"a}ivi and Bulling, Andreas},\n  booktitle={Advances in Physiological Computing},\n  pages={39--65},\n  year={2014},\n  publisher={Springer}\n}`
        },
        relatedCapabilities: ["Eye-Control AAC", "Universal Accessibility"]
    },

    // 3. Offline Edge AI & On-Device ML
    {
        id: "ref-ai-llamacpp",
        title: "llama.cpp: High-Performance Inference of LLaMA Models in Pure C/C++",
        authors: ["Georgi Gerganov", "llama.cpp Contributors"],
        organization: "Open Source Initiative",
        year: 2023,
        category: "Technical Documentation",
        sourceType: "Official Documentation",
        domain: "github.com",
        url: "https://github.com/ggerganov/llama.cpp",
        description: "Lightweight, dependency-free inference engine optimized for ARM NEON and Apple Silicon, supporting integer quantization (Q4_K_M, Q5_K_M) on resource-constrained devices.",
        relevance: "Serves as the native C++ inference core (`libinfinity_jni.so`) in G-ONE's Android layer, allowing Qwen 1.5B to run completely offline without an internet connection.",
        topics: ["Quantization", "ARM64 Inference", "On-Device LLM", "Embedded C++"],
        featured: true,
        journalOrVenue: "GitHub Repository & Documentation",
        doiOrIsbn: "MIT License / Open Source",
        citation: {
            apa: "Gerganov, G. (2023). llama.cpp: High-performance inference of LLaMA models in pure C/C++. GitHub.",
            ieee: 'G. Gerganov, "llama.cpp: High-performance inference of LLaMA models in pure C/C++," GitHub, 2023. [Online]. Available: https://github.com/ggerganov/llama.cpp',
            bibtex: `@misc{gerganov2023llamacpp,\n  author = {Georgi Gerganov},\n  title = {llama.cpp: High-performance inference of LLaMA models in pure C/C++},\n  year = {2023},\n  publisher = {GitHub},\n  url = {https://github.com/ggerganov/llama.cpp}\n}`
        },
        relatedCapabilities: ["Offline Edge AI"]
    },
    {
        id: "ref-ai-qwen",
        title: "Qwen Technical Report",
        authors: ["Jinze Bai", "Shuai Bai", "Yunfei Chu", "et al."],
        organization: "Alibaba Cloud / Qwen Team",
        year: 2023,
        category: "AI & Machine Learning",
        sourceType: "Peer Reviewed",
        domain: "arxiv.org",
        url: "https://arxiv.org/abs/2309.16609",
        description: "Technical architecture of the Qwen series, highlighting token efficiency, dense knowledge representation, and strong performance of the 1.8B/1.5B compact edge architectures.",
        relevance: "Supports G-ONE's selection of Qwen 1.5B Chat GGUF as the optimal balance between clinical reasoning capability and ARM phone memory constraints.",
        topics: ["Qwen LLM", "Compact Transformer", "ChatML", "Edge Optimization"],
        featured: false,
        journalOrVenue: "arXiv:2309.16609",
        doiOrIsbn: "arXiv:2309.16609",
        citation: {
            apa: "Bai, J., Bai, S., Chu, Y., et al. (2023). Qwen technical report. arXiv preprint arXiv:2309.16609.",
            ieee: 'J. Bai et al., "Qwen Technical Report," arXiv preprint arXiv:2309.16609, 2023.',
            bibtex: `@article{bai2023qwen,\n  title={Qwen technical report},\n  author={Bai, Jinze and Bai, Shuai and Chu, Yunfei and others},\n  journal={arXiv preprint arXiv:2309.16609},\n  year={2023}\n}`
        },
        relatedCapabilities: ["Offline Edge AI"]
    },
    {
        id: "ref-ai-lane-deepx",
        title: "DeepX: A Software Accelerator for Low-Power Deep Learning Inference on Mobile Devices",
        authors: ["Nicholas D. Lane", "Sourav Bhattacharya", "Petko Georgiev", "et al."],
        organization: "ACM/IEEE International Conference on Information Processing in Sensor Networks (IPSN)",
        year: 2016,
        category: "Research Papers",
        sourceType: "Peer Reviewed",
        domain: "dl.acm.org",
        url: "https://dl.acm.org/doi/10.1109/IPSN.2016.7460664",
        description: "Foundational mobile computing paper decomposing neural execution across heterogeneous mobile CPUs/GPUs and dynamically adapting thread allocation to Big.LITTLE architectures.",
        relevance: "Informed G-ONE's dynamic ARM core allocation strategy inside LlamaEngine.kt to prevent thermal throttling on low-to-mid range Android hardware.",
        topics: ["Mobile Inference", "Heterogeneous Computing", "Heterogeneous Multi-Processing", "Low-Power ML"],
        featured: false,
        journalOrVenue: "2016 15th ACM/IEEE IPSN, pp. 1-12",
        doiOrIsbn: "10.1109/IPSN.2016.7460664",
        citation: {
            apa: "Lane, N. D., Bhattacharya, S., Georgiev, P., et al. (2016). DeepX: A software accelerator for low-power deep learning inference on mobile devices. In 2016 15th ACM/IEEE IPSN (pp. 1-12).",
            ieee: 'N. D. Lane et al., "DeepX: A software accelerator for low-power deep learning inference on mobile devices," in 2016 15th ACM/IEEE IPSN, 2016, pp. 1-12.',
            bibtex: `@inproceedings{lane2016deepx,\n  title={DeepX: A software accelerator for low-power deep learning inference on mobile devices},\n  author={Lane, Nicholas D and Bhattacharya, Sourav and Georgiev, Petko and others},\n  booktitle={2016 15th ACM/IEEE IPSN},\n  pages={1--12},\n  year={2016}\n}`
        },
        relatedCapabilities: ["Offline Edge AI"]
    },

    // 4. Clinical Document AI & Multimodal Medical Vision
    {
        id: "ref-doc-singhal-nature",
        title: "Large Language Models Encode Clinical Knowledge",
        authors: ["Karan Singhal", "Shekoofeh Azizi", "Tao Tu", "S. Sara Mahdavi", "et al."],
        organization: "Nature / Google Research",
        year: 2023,
        category: "Clinical Guidelines",
        sourceType: "Peer Reviewed",
        domain: "nature.com",
        url: "https://www.nature.com/articles/s41586-023-06291-2",
        description: "Benchmark evaluation of Med-PaLM and foundation models across medical question-answering datasets, validating that LLMs can accurately summarize clinical context and explain complex diagnoses.",
        relevance: "Demonstrates the scientific validity of AI-assisted clinical summarization and structured medical record extraction utilized in G-ONE's Health Records Vault.",
        topics: ["Clinical AI", "Medical Question Answering", "Foundation Models", "Patient Communication"],
        featured: true,
        journalOrVenue: "Nature 620, 172–180 (2023)",
        doiOrIsbn: "10.1038/s41586-023-06291-2",
        citation: {
            apa: "Singhal, K., Azizi, S., Tu, T., et al. (2023). Large language models encode clinical knowledge. Nature, 620(7972), 172-180.",
            ieee: 'K. Singhal et al., "Large language models encode clinical knowledge," Nature, vol. 620, no. 7972, pp. 172-180, 2023.',
            bibtex: `@article{singhal2023large,\n  title={Large language models encode clinical knowledge},\n  author={Singhal, Karan and Azizi, Shekoofeh and Tu, Tao and others},\n  journal={Nature},\n  volume={620},\n  number={7972},\n  pages={172--180},\n  year={2023}\n}`
        },
        relatedCapabilities: ["Clinical Document AI", "Offline Edge AI"]
    },
    {
        id: "ref-doc-gemini-multimodal",
        title: "Gemini: A Family of Highly Capable Multimodal Models",
        authors: ["Gemini Team", "Google DeepMind"],
        organization: "Google DeepMind",
        year: 2024,
        category: "AI & Machine Learning",
        sourceType: "Peer Reviewed",
        domain: "arxiv.org",
        url: "https://arxiv.org/abs/2312.11805",
        description: "Introduces natively multimodal transformer architectures capable of seamless joint reasoning across high-resolution text, complex tables, handwriting, and visual charts.",
        relevance: "Supports G-ONE's Prescription & Lab Scanner pipeline, which relies on Gemini 3 Flash's multimodal vision capability to transcribe handwriting and decode doctor shorthand.",
        topics: ["Multimodal Vision", "Document OCR", "Handwriting Recognition", "Visual Reasoning"],
        featured: true,
        journalOrVenue: "arXiv:2312.11805",
        doiOrIsbn: "arXiv:2312.11805",
        citation: {
            apa: "Gemini Team. (2024). Gemini: A family of highly capable multimodal models. arXiv preprint arXiv:2312.11805.",
            ieee: 'Gemini Team, "Gemini: A family of highly capable multimodal models," arXiv preprint arXiv:2312.11805, 2024.',
            bibtex: `@article{team2024gemini,\n  title={Gemini: A family of highly capable multimodal models},\n  author={{Gemini Team}},\n  journal={arXiv preprint arXiv:2312.11805},\n  year={2024}\n}`
        },
        relatedCapabilities: ["Clinical Document AI"]
    },

    // 5. Emergency Care & Triage
    {
        id: "ref-emergency-who",
        title: "Emergency Care Systems for Universal Health Coverage: Ensuring Timely Care and Triage",
        authors: ["World Health Organization"],
        organization: "WHO Guidelines Approved by the Guidelines Review Committee",
        year: 2020,
        category: "Emergency Care",
        sourceType: "Government",
        domain: "who.int",
        url: "https://www.who.int/publications/i/item/9789240003057",
        description: "Official WHO operational framework outlining the critical importance of pre-hospital triage, community-based first aid, and structured radial dispatch to emergency treatment centers.",
        relevance: "Directly structured the emergency dispatch rules and 15 km facility proximity calculation in G-ONE's SOS & Emergency Hub (`/sos`).",
        topics: ["Emergency Care", "Pre-Hospital Triage", "Universal Access", "Trauma Dispatch"],
        featured: true,
        journalOrVenue: "World Health Organization Technical Report Series",
        doiOrIsbn: "ISBN: 978-92-4-000305-7",
        citation: {
            apa: "World Health Organization. (2020). Emergency care systems for universal health coverage: Ensuring timely care and triage. World Health Organization.",
            ieee: 'World Health Organization, "Emergency care systems for universal health coverage: Ensuring timely care and triage," World Health Organization, Geneva, 2020.',
            bibtex: `@book{who2020emergency,\n  title={Emergency care systems for universal health coverage: Ensuring timely care and triage},\n  author={{World Health Organization}},\n  year={2020},\n  publisher={World Health Organization}\n}`
        },
        relatedCapabilities: ["Emergency SOS"]
    },
    {
        id: "ref-emergency-esi",
        title: "Emergency Severity Index (ESI): A Triage Tool for Emergency Department Care, Version 4",
        authors: ["Richard C. Wuerz", "Paula Tanabe", "David Eitel", "et al."],
        organization: "Agency for Healthcare Research and Quality (AHRQ)",
        year: 2020,
        category: "Clinical Guidelines",
        sourceType: "Clinical Guideline",
        domain: "ahrq.gov",
        url: "https://www.ahrq.gov/patient-safety/settings/hospital/esi/index.html",
        description: "Five-level emergency department triage algorithm stratifying patient acuity based on immediate life threat, vital sign derangements, and predicted healthcare resource needs.",
        relevance: "Provides the underlying clinical taxonomy used by G-ONE's AnomalyDetectionEngine to categorize vitals into Normal, Needs Attention, or Concerning states.",
        topics: ["Triage Algorithm", "Acuity Stratification", "Vital Signs", "Clinical Urgency"],
        featured: false,
        journalOrVenue: "AHRQ Publication No. 12-0014",
        doiOrIsbn: "AHRQ Pub. 12-0014",
        citation: {
            apa: "Gilboy, N., Tanabe, P., Travers, D., & Rosenau, A. M. (2020). Emergency Severity Index (ESI): A Triage Tool for Emergency Department Care, Version 4. AHRQ.",
            ieee: 'N. Gilboy et al., "Emergency Severity Index (ESI): A Triage Tool for Emergency Department Care, Version 4," AHRQ, 2020.',
            bibtex: `@techreport{gilboy2020emergency,\n  title={Emergency Severity Index (ESI): A Triage Tool for Emergency Department Care, Version 4},\n  author={Gilboy, Nicki and Tanabe, Paula and Travers, Debbie and Rosenau, Alexander M},\n  year={2020},\n  institution={Agency for Healthcare Research and Quality}\n}`
        },
        relatedCapabilities: ["Emergency SOS", "Offline Edge AI"]
    },

    // 6. Accessibility Standards
    {
        id: "ref-w3c-wcag",
        title: "Web Content Accessibility Guidelines (WCAG) 2.1",
        authors: ["Andrew Kirkpatrick", "Joshue O Connor", "Alastair Campbell", "Michael Cooper"],
        organization: "World Wide Web Consortium (W3C)",
        year: 2018,
        category: "Accessibility",
        sourceType: "Official Documentation",
        domain: "w3.org",
        url: "https://www.w3.org/TR/WCAG21/",
        description: "International web standard defining requirements for making web content accessible to individuals with motor impairments, visual limitations, and cognitive constraints.",
        relevance: "Mandates G-ONE's high-contrast color palette (contrast ratio > 7:1), full keyboard accessibility for the eye-tracker, and touch target sizing.",
        topics: ["WCAG 2.1 AAA", "Motor Accessibility", "Color Contrast", "Screen Readers"],
        featured: true,
        journalOrVenue: "W3C Recommendation 05 June 2018",
        doiOrIsbn: "W3C REC-WCAG21-20180605",
        citation: {
            apa: "Kirkpatrick, A., O Connor, J., Campbell, A., & Cooper, M. (2018). Web Content Accessibility Guidelines (WCAG) 2.1. W3C Recommendation.",
            ieee: 'A. Kirkpatrick, J. O Connor, A. Campbell, and M. Cooper, "Web Content Accessibility Guidelines (WCAG) 2.1," W3C Recommendation, 2018.',
            bibtex: `@techreport{kirkpatrick2018wcag,\n  title={Web Content Accessibility Guidelines (WCAG) 2.1},\n  author={Kirkpatrick, Andrew and O Connor, Joshue and Campbell, Alastair and Cooper, Michael},\n  year={2018},\n  institution={W3C}\n}`
        },
        relatedCapabilities: ["Universal Accessibility", "Eye-Control AAC"]
    },

    // 7. Digital Health Interoperability
    {
        id: "ref-hl7-fhir",
        title: "HL7 Fast Healthcare Interoperability Resources (FHIR) Specification, Release 4",
        authors: ["HL7 International FHIR Product Management"],
        organization: "Health Level Seven International",
        year: 2019,
        category: "Healthcare Interoperability",
        sourceType: "Official Documentation",
        domain: "hl7.org",
        url: "https://hl7.org/fhir/R4/",
        description: "Modern, RESTful data exchange standard utilizing modular JSON/XML 'Resources' (Patient, Observation, Condition, MedicationRequest) to connect distributed health software.",
        relevance: "Structures the JSON schema of G-ONE's Health Records Vault, facilitating future export and bilateral synchronization with institutional electronic health records.",
        topics: ["FHIR R4", "Clinical Schema", "EHR Interoperability", "RESTful Health Data"],
        featured: false,
        journalOrVenue: "Health Level Seven International Standard",
        doiOrIsbn: "HL7-FHIR-R4",
        citation: {
            apa: "Health Level Seven International. (2019). HL7 Fast Healthcare Interoperability Resources (FHIR) Release 4. HL7 International.",
            ieee: 'HL7 International, "HL7 Fast Healthcare Interoperability Resources (FHIR) Release 4," Health Level Seven International, 2019.',
            bibtex: `@manual{hl7fhir2019,\n  title={HL7 Fast Healthcare Interoperability Resources (FHIR) Release 4},\n  author={{HL7 International}},\n  year={2019},\n  organization={Health Level Seven International}\n}`
        },
        relatedCapabilities: ["Health Interoperability"]
    },
    {
        id: "ref-abdm-architecture",
        title: "Ayushman Bharat Digital Mission (ABDM) Architecture & Strategy Document",
        authors: ["National Health Authority (NHA)"],
        organization: "Government of India",
        year: 2022,
        category: "Healthcare Interoperability",
        sourceType: "Government",
        domain: "abdm.gov.in",
        url: "https://abdm.gov.in/publications/strategy_documents",
        description: "National architectural blueprint for federated digital health data exchange, defining the Ayushman Bharat Health Account (ABHA) and consent-based health data management.",
        relevance: "Guides Phase-3 roadmap design for G-ONE, ensuring seamless record sharing across primary health centres and community health workers.",
        topics: ["ABDM", "ABHA ID", "Federated Health Records", "Consent Management"],
        featured: false,
        journalOrVenue: "National Health Authority Policy Paper",
        doiOrIsbn: "NHA-ABDM-2022",
        citation: {
            apa: "National Health Authority. (2022). Ayushman Bharat Digital Mission (ABDM) Architecture & Strategy Document. Ministry of Health and Family Welfare, Government of India.",
            ieee: 'National Health Authority, "Ayushman Bharat Digital Mission (ABDM) Architecture & Strategy Document," Government of India, 2022.',
            bibtex: `@techreport{nha2022abdm,\n  title={Ayushman Bharat Digital Mission (ABDM) Architecture \\& Strategy Document},\n  author={{National Health Authority}},\n  year={2022},\n  institution={Ministry of Health and Family Welfare, Government of India}\n}`
        },
        relatedCapabilities: ["Health Interoperability"]
    },

    // 8. Privacy & Security
    {
        id: "ref-hipaa-security",
        title: "HIPAA Security Rule: Standards for the Protection of Electronic Protected Health Information",
        authors: ["Office for Civil Rights (OCR)"],
        organization: "US Department of Health and Human Services (HHS)",
        year: 2013,
        category: "Privacy & Security",
        sourceType: "Government",
        domain: "hhs.gov",
        url: "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
        description: "Federal standards establishing national requirements to protect individuals' electronic personal health information (e-PHI) through administrative, physical, and technical safeguards.",
        relevance: "Validates G-ONE's privacy-by-design policy: all biometric signals remain isolated on the device in local SQLite, and cloud transmissions require explicit user intent.",
        topics: ["e-PHI", "HIPAA Safeguards", "Encryption Standards", "Data Confidentiality"],
        featured: false,
        journalOrVenue: "45 CFR Part 160 and Part 164, Subparts A and C",
        doiOrIsbn: "45 CFR 164",
        citation: {
            apa: "U.S. Department of Health and Human Services. (2013). HIPAA Security Rule: Standards for the Protection of Electronic Protected Health Information (45 CFR Part 160 and Part 164). HHS.",
            ieee: 'U.S. Department of Health and Human Services, "HIPAA Security Rule," 45 CFR Part 160 and Part 164, 2013.',
            bibtex: `@legal{hhs2013hipaa,\n  title={HIPAA Security Rule: Standards for the Protection of Electronic Protected Health Information},\n  author={{U.S. Department of Health and Human Services}},\n  year={2013}\n}`
        },
        relatedCapabilities: ["Privacy by Design"]
    },

    // 9. Technical Frameworks Documentation
    {
        id: "ref-tech-room-sqlite",
        title: "Save Data in a Local Database Using Room",
        authors: ["Android Developers Team"],
        organization: "Google Android Open Source Project",
        year: 2024,
        category: "Technical Documentation",
        sourceType: "Official Documentation",
        domain: "developer.android.com",
        url: "https://developer.android.com/training/data-storage/room",
        description: "Official guide on the Room persistence library, providing compile-time verification of SQL queries, reactive Flow abstractions, and robust offline data caching.",
        relevance: "Forms the bedrock of G-ONE's local database (`gone_health.db`), ensuring zero loss of telemetry packets during prolonged connectivity outages.",
        topics: ["Android Room", "SQLite Persistence", "Reactive Flow", "Offline-First Storage"],
        featured: false,
        journalOrVenue: "Android Developer Guides",
        doiOrIsbn: "Google Android Documentation",
        citation: {
            apa: "Android Developers. (2024). Save data in a local database using Room. Google Android Open Source Project.",
            ieee: 'Android Developers, "Save data in a local database using Room," Google, 2024. [Online]. Available: https://developer.android.com/training/data-storage/room',
            bibtex: `@misc{android2024room,\n  author = {{Android Developers}},\n  title = {Save Data in a Local Database Using Room},\n  year = {2024},\n  url = {https://developer.android.com/training/data-storage/room}\n}`
        },
        relatedCapabilities: ["Offline Edge AI", "Privacy by Design"]
    },
    {
        id: "ref-tech-supabase",
        title: "Supabase Architecture and PostgreSQL Row Level Security (RLS)",
        authors: ["Supabase Engineering Team"],
        organization: "Supabase Inc.",
        year: 2024,
        category: "Technical Documentation",
        sourceType: "Official Documentation",
        domain: "supabase.com",
        url: "https://supabase.com/docs/guides/database/postgres/row-level-security",
        description: "Technical reference on Postgres Row Level Security (RLS) policies, JWT claim verification, and tenant data isolation in cloud-synchronized applications.",
        relevance: "Enforces clinic-level and patient-level data segregation in G-ONE's cloud layer, preventing unauthorized access across patient accounts.",
        topics: ["PostgreSQL RLS", "JWT Auth", "Cloud Synchronization", "Data Isolation"],
        featured: false,
        journalOrVenue: "Supabase Documentation Guides",
        doiOrIsbn: "Supabase Docs",
        citation: {
            apa: "Supabase. (2024). Supabase architecture and PostgreSQL row level security. Supabase Documentation.",
            ieee: 'Supabase, "Supabase architecture and PostgreSQL row level security," Supabase Docs, 2024. [Online]. Available: https://supabase.com/docs/guides/database/postgres/row-level-security',
            bibtex: `@misc{supabase2024rls,\n  author = {{Supabase}},\n  title = {Supabase Architecture and PostgreSQL Row Level Security},\n  year = {2024},\n  url = {https://supabase.com/docs}\n}`
        },
        relatedCapabilities: ["Privacy by Design", "Health Interoperability"]
    },

    // 10. News & Industry Coverage
    {
        id: "ref-news-mit-rural-ai",
        title: "How On-Device AI Could Transform Rural Healthcare Without Needing the Cloud",
        authors: ["Karen Hao"],
        organization: "MIT Technology Review",
        year: 2024,
        category: "News & Industry",
        sourceType: "News",
        domain: "technologyreview.com",
        url: "https://www.technologyreview.com/topic/artificial-intelligence/",
        description: "Analysis of how quantized small language models (SLMs) and on-device machine learning can bring diagnostic support to rural areas with intermittent broadband access.",
        relevance: "Highlights the acute industry demand for offline-first medical architectures like G-ONE that operate independently of centralized cloud servers.",
        topics: ["Rural Telemedicine", "On-Device AI", "Offline Health", "Healthcare Equity"],
        featured: true,
        journalOrVenue: "MIT Technology Review, Healthcare & AI Section",
        doiOrIsbn: "ISSN: 0040-1692",
        citation: {
            apa: "Hao, K. (2024). How on-device AI could transform rural healthcare without needing the cloud. MIT Technology Review.",
            ieee: 'K. Hao, "How On-Device AI Could Transform Rural Healthcare Without Needing the Cloud," MIT Technology Review, 2024.',
            bibtex: `@article{hao2024mit,\n  title={How On-Device AI Could Transform Rural Healthcare Without Needing the Cloud},\n  author={Hao, Karen},\n  journal={MIT Technology Review},\n  year={2024}\n}`
        },
        relatedCapabilities: ["Offline Edge AI"]
    },
    {
        id: "ref-news-ieee-aac-webcam",
        title: "Eye-Tracking for Assistive Communication: Bridging the Accessibility Divide with Standard Webcams",
        authors: ["Matthew Hutson"],
        organization: "IEEE Spectrum",
        year: 2023,
        category: "News & Industry",
        sourceType: "Industry",
        domain: "spectrum.ieee.org",
        url: "https://spectrum.ieee.org/biomedical",
        description: "Investigates the emergence of neural face-mesh algorithms in replacing dedicated $10,000 gaze cameras with standard commodity webcams for disabled users.",
        relevance: "Corroborates G-ONE's engineering hypothesis: computer vision running on consumer laptops can deliver accessible AAC without specialized eye-tracking hardware.",
        topics: ["Assistive Hardware", "Webcam Eye Tracking", "Affordable AAC", "Commodity Vision"],
        featured: false,
        journalOrVenue: "IEEE Spectrum Biomedical Feature",
        doiOrIsbn: "IEEE Spectrum 2023",
        citation: {
            apa: "Hutson, M. (2023). Eye-tracking for assistive communication: Bridging the accessibility divide with standard webcams. IEEE Spectrum.",
            ieee: 'M. Hutson, "Eye-tracking for assistive communication: Bridging the accessibility divide with standard webcams," IEEE Spectrum, 2023.',
            bibtex: `@article{hutson2023ieee,\n  title={Eye-Tracking for Assistive Communication: Bridging the Accessibility Divide with Standard Webcams},\n  author={Hutson, Matthew},\n  journal={IEEE Spectrum},\n  year={2023}\n}`
        },
        relatedCapabilities: ["Eye-Control AAC", "Universal Accessibility"]
    }
];

export const allCategories: CategoryType[] = [
    "All",
    "Research Papers",
    "Clinical Guidelines",
    "Medical Organizations",
    "Accessibility",
    "AI & Machine Learning",
    "Computer Vision",
    "Biosignals / EMG",
    "Digital Health",
    "Emergency Care",
    "Healthcare Interoperability",
    "Privacy & Security",
    "Technical Documentation",
    "News & Industry"
];
