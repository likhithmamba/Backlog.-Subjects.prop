export interface ExamSession {
  code: string;
  name: string;
  shortName: string;
  semesterType: "Regular" | "Supplementary";
  term: "Winter" | "Summer";
  year: number;
}

export const EXAM_SESSIONS: ExamSession[] = [
  { code: "2021-R", name: "Jan-Feb 2021 Regular Examination (Odd Sem)", shortName: "2021 Reg", semesterType: "Regular", term: "Winter", year: 2021 },
  { code: "2021-S", name: "June-July 2021 Supplementary/Makeup Examination", shortName: "2021 Supp", semesterType: "Supplementary", term: "Summer", year: 2021 },
  { code: "2022-R", name: "Jan-Feb 2022 Regular Examination (Odd Sem)", shortName: "2022 Reg", semesterType: "Regular", term: "Winter", year: 2022 },
  { code: "2022-S", name: "June-July 2022 Supplementary/Makeup Examination", shortName: "2022 Supp", semesterType: "Supplementary", term: "Summer", year: 2022 },
  { code: "2023-R", name: "Jan-Feb 2023 Regular Examination (Odd Sem)", shortName: "2023 Reg", semesterType: "Regular", term: "Winter", year: 2023 },
  { code: "2023-S", name: "June-July 2023 Supplementary/Makeup Examination", shortName: "2023 Supp", semesterType: "Supplementary", term: "Summer", year: 2023 },
  { code: "2024-R", name: "Jan-Feb 2024 Regular Examination (Odd Sem)", shortName: "2024 Reg", semesterType: "Regular", term: "Winter", year: 2024 },
  { code: "2024-S", name: "June-July 2024 Supplementary/Makeup Examination", shortName: "2024 Supp", semesterType: "Supplementary", term: "Summer", year: 2024 },
  { code: "2025-R", name: "Jan-Feb 2025 Regular Examination (Odd Sem)", shortName: "2025 Reg", semesterType: "Regular", term: "Winter", year: 2025 },
  { code: "2025-S", name: "June-July 2025 Supplementary/Makeup Examination", shortName: "2025 Supp", semesterType: "Supplementary", term: "Summer", year: 2025 }
];

export interface Question {
  id: string;
  module: number;
  part: "Part A" | "Part B";
  question: string;
  concept: string;
  marks: number;
  years: number[]; // e.g. [2021, 2022, 2023, 2024, 2025]
  sessions: string[]; // matching EXAM_SESSIONS codes
  difficulty: "Easy" | "Medium" | "Hard";
  repeatedCount: number;
  predictedRecurrence: number; // percentage (e.g. 85)
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  branch: string;
  scheme: string;
  university: string;
  modules: {
    number: number;
    title: string;
    description: string;
  }[];
  questions: Question[];
}

export interface Branch {
  id: string;
  name: string;
}

export interface Scheme {
  id: string;
  name: string;
}

export interface University {
  id: string;
  name: string;
}

export const UNIVERSITIES: University[] = [
  { id: "VTU", name: "Visvesvaraya Technological University (VTU)" },
  { id: "ANNA", name: "Anna University" },
  { id: "JNTU", name: "Jawaharlal Nehru Technological University (JNTU)" },
  { id: "AKTU", name: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)" },
];

export const SCHEMES: Scheme[] = [
  { id: "2022", name: "2022 Scheme (NEP)" },
  { id: "2021", name: "2021 Scheme (CBCS)" },
  { id: "2018", name: "2018 Scheme (CBCS)" },
  { id: "2017", name: "2017 Scheme" },
];

export const BRANCHES: Branch[] = [
  { id: "ECE", name: "Electronics & Communication Engineering" },
  { id: "CSE", name: "Computer Science & Engineering" },
  { id: "ISE", name: "Information Science & Engineering" },
  { id: "EEE", name: "Electrical & Electronics Engineering" },
  { id: "ME", name: "Mechanical Engineering" },
];

export const SUBJECTS_DATA: Subject[] = [
  // ==========================================
  // VTU -> 2018 Scheme -> ECE -> Semester 5
  // ==========================================
  {
    id: "vtu-ece-5-18-51",
    name: "Technological Innovation Management and Entrepreneurship",
    code: "18EC51",
    semester: 5,
    branch: "ECE",
    scheme: "2018",
    university: "VTU",
    modules: [
      { number: 1, title: "Management", description: "Definition of Management, Functions, Roles of Managers, Levels of Management, Planning & Decision Making." },
      { number: 2, title: "Organizing & Staffing", description: "Nature and purpose of organizing, Departmentation, Span of control, Staffing definition, Recruitment, Selection." },
      { number: 3, title: "Directing & Controlling", description: "Principles of directing, Leadership styles, Motivation theories, Communication networks, Controlling steps & types." },
      { number: 4, title: "Social Responsibilities & Entrepreneurship", description: "Social responsibility of business, Entrepreneur definitions, types, barriers, roles of entrepreneurs in economic growth." },
      { number: 5, title: "Small Scale Industries & Project Preparation", description: "SSI definition, government support, Project identification, Project report preparation, Feasibility study." }
    ],
    questions: [
      {
        id: "18ec51-q1",
        module: 1,
        part: "Part A",
        question: "Define Management. Explain the functions of management in detail, highlighting the role of planning.",
        concept: "Functions of Management",
        marks: 10,
        years: [2021, 2022, 2024],
        sessions: ["2021-R", "2022-R", "2024-R"],
        difficulty: "Easy",
        repeatedCount: 3,
        predictedRecurrence: 78,
        description: "Core conceptual question. Always present in Module 1. Explain Planning, Organizing, Staffing, Directing, and Controlling."
      },
      {
        id: "18ec51-q2",
        module: 2,
        part: "Part A",
        question: "Differentiate between Formal and Informal organizations. Explain the concept of Departmentation and its various types.",
        concept: "Departmentation",
        marks: 10,
        years: [2021, 2023, 2025],
        sessions: ["2021-R", "2023-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 3,
        predictedRecurrence: 82,
        description: "A highly repeated question in Module 2. Must cover departmentation by function, territory, product, and customer."
      },
      {
        id: "18ec51-q3",
        module: 3,
        part: "Part A",
        question: "Explain Maslow's Hierarchy of Needs theory of motivation. Discuss how it differs from Herzberg's two-factor theory.",
        concept: "Motivation Theories",
        marks: 10,
        years: [2022, 2023, 2025],
        sessions: ["2022-S", "2023-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 3,
        predictedRecurrence: 85,
        description: "Classic management question. Draw Maslow's pyramid diagram for maximum scoring."
      },
      {
        id: "18ec51-q4",
        module: 4,
        part: "Part A",
        question: "Define an Entrepreneur. Explain the types of entrepreneurs and the common barriers faced by them during business initiation.",
        concept: "Entrepreneur Types & Barriers",
        marks: 10,
        years: [2021, 2022, 2024],
        sessions: ["2021-S", "2022-R", "2024-R"],
        difficulty: "Easy",
        repeatedCount: 3,
        predictedRecurrence: 75,
        description: "Module 4 core focus. Make sure to detail Fabian, Drone, Imitative, and Innovative entrepreneurs."
      },
      {
        id: "18ec51-q5",
        module: 5,
        part: "Part A",
        question: "Describe the steps involved in the preparation of a Project Report for starting a Small Scale Industry (SSI).",
        concept: "Project Report SSI",
        marks: 10,
        years: [2021, 2023, 2025],
        sessions: ["2021-R", "2023-S", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 3,
        predictedRecurrence: 88,
        description: "Essential final module question. Outline technical, financial, and marketing feasibility."
      }
    ]
  },
  {
    id: "vtu-ece-5-18-52",
    name: "Digital Signal Processing",
    code: "18EC52",
    semester: 5,
    branch: "ECE",
    scheme: "2018",
    university: "VTU",
    modules: [
      { number: 1, title: "Discrete Fourier Transform (DFT)", description: "Introduction to DFT, IDFT, DFT as a linear transformation, properties of DFT, circular convolution." },
      { number: 2, title: "Fast Fourier Transform (FFT) Algorithms", description: "Computation of DFT, Decimation-In-Time (DIT) and Decimation-In-Frequency (DIF) FFT algorithms, chirp z-transform." },
      { number: 3, title: "Design of IIR Filters", description: "Analog filter specifications, Butterworth and Chebyshev filter design, bilinear transformation, impulse invariance methods." },
      { number: 4, title: "Design of FIR Filters", description: "Symmetric and anti-symmetric FIR filters, design of FIR filters using Windowing techniques (Rectangular, Hamming, Hanning, Kaiser)." },
      { number: 5, title: "Realization of Digital Filters", description: "Direct Form I & II, Cascade, Parallel, Lattice-ladder realizations for IIR/FIR filters, Finite Word Length Effects." }
    ],
    questions: [
      {
        id: "18ec52-q1",
        module: 1,
        part: "Part A",
        question: "Compute the 8-point DFT of the sequence x[n] = {1, 1, 1, 1, 0, 0, 0, 0} using circular definition or matrix calculation method.",
        concept: "DFT Computation",
        marks: 8,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-R", "2023-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 4,
        predictedRecurrence: 94,
        description: "Extremely high repeating numerical. Show each step of real and imaginary parts computation."
      },
      {
        id: "18ec52-q1b",
        module: 1,
        part: "Part B",
        question: "State and prove circular frequency shift and Parseval's relation properties of the Discrete Fourier Transform.",
        concept: "DFT Properties",
        marks: 8,
        years: [2021, 2023, 2024],
        sessions: ["2021-S", "2023-S", "2024-R"],
        difficulty: "Easy",
        repeatedCount: 3,
        predictedRecurrence: 79,
        description: "Popular theory proof in Module 1. Usually combined with a small numerical problem."
      },
      {
        id: "18ec52-q2",
        module: 2,
        part: "Part A",
        question: "Derive and draw the Radix-2 Decimation-In-Time (DIT) FFT signal flow graph for N = 8. Explain the butterfly diagram computation.",
        concept: "Radix-2 DIT FFT",
        marks: 10,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-S", "2023-R", "2025-R"],
        difficulty: "Hard",
        repeatedCount: 4,
        predictedRecurrence: 91,
        description: "A highly fundamental question. Draw three stages of butterfly structures clearly showing twiddle factors W_N^k."
      },
      {
        id: "18ec52-q3",
        module: 3,
        part: "Part A",
        question: "Design an analog Butterworth low-pass filter to meet specifications: passband attenuation <= 1dB at 100Hz, stopband attenuation >= 40dB at 500Hz.",
        concept: "Butterworth Filter Design",
        marks: 10,
        years: [2021, 2022, 2024],
        sessions: ["2021-S", "2022-R", "2024-R"],
        difficulty: "Hard",
        repeatedCount: 3,
        predictedRecurrence: 84,
        description: "Core design problem in Module 3. Show order calculation 'n' and transfer function H(s)."
      },
      {
        id: "18ec52-q4",
        module: 4,
        part: "Part A",
        question: "Design an FIR bandpass filter with frequency response Hd(w) = e^(-j3w) for 0.3*pi <= |w| <= 0.7*pi using a Hamming window with N=7.",
        concept: "FIR Filter Design (Windowing)",
        marks: 12,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-R", "2023-S", "2025-S"],
        difficulty: "Hard",
        repeatedCount: 4,
        predictedRecurrence: 88,
        description: "Classic Windowing numerical. Write down coefficients h[n] clearly for n=0 to N-1."
      },
      {
        id: "18ec52-q5",
        module: 5,
        part: "Part A",
        question: "Obtain the Direct Form I, Direct Form II, Cascade, and Parallel realizations of the system H(z) = (1 + 0.5z^-1) / (1 - 0.75z^-1 + 0.125z^-2).",
        concept: "Digital Filter Realization",
        marks: 10,
        years: [2021, 2022, 2023, 2024, 2025],
        sessions: ["2021-R", "2022-R", "2023-R", "2024-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 5,
        predictedRecurrence: 96,
        description: "High-yield guaranteed scoring question. Make sure to represent delays as z^-1, multipliers as triangles, and adders correctly."
      }
    ]
  },
  {
    id: "vtu-ece-5-18-53",
    name: "Principles of Communication Systems",
    code: "18EC53",
    semester: 5,
    branch: "ECE",
    scheme: "2018",
    university: "VTU",
    modules: [
      { number: 1, title: "Amplitude Modulation (AM)", description: "Double Sideband Suppressed Carrier (DSB-SC), conventional AM, Single Sideband (SSB), Vestigial Sideband (VSB), envelop detection." },
      { number: 2, title: "Angle Modulation", description: "Frequency Modulation (FM) and Phase Modulation (PM), Narrowband FM, Wideband FM, transmission bandwidth, FM generation and demodulation." },
      { number: 3, title: "Random Processes & Noise", description: "Probability, random variables, power spectral density, noise in AM receivers, noise in FM receivers, pre-emphasis and de-emphasis." },
      { number: 4, title: "Syllabus Standard Transceivers", description: "Superheterodyne receiver, intermediate frequency (IF), tracking, AGC, FM stereo multiplexing." },
      { number: 5, title: "Digitization & Baseband Transmission", description: "Sampling theorem, quantization, Pulse Code Modulation (PCM), Delta Modulation (DM), T1 carrier system." }
    ],
    questions: [
      {
        id: "18ec53-q1",
        module: 1,
        part: "Part A",
        question: "Explain the generation of DSB-SC using a Ring Modulator. Derive the mathematical expression and sketch the spectrum.",
        concept: "DSB-SC Ring Modulator",
        marks: 8,
        years: [2021, 2022, 2024],
        sessions: ["2021-R", "2022-R", "2024-R"],
        difficulty: "Medium",
        repeatedCount: 3,
        predictedRecurrence: 80,
        description: "Standard derivation and circuit diagram. Be careful with diode switching states."
      },
      {
        id: "18ec53-q2",
        module: 2,
        part: "Part A",
        question: "Derive the mathematical equation of a Single-Tone Frequency Modulated (FM) wave. Define modulation index and describe narrowband FM.",
        concept: "Single-Tone FM",
        marks: 10,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-S", "2022-S", "2023-R", "2025-R"],
        difficulty: "Hard",
        repeatedCount: 4,
        predictedRecurrence: 87,
        description: "Derivation includes instantaneous frequency integration. Draw phasor diagram of narrowband FM."
      },
      {
        id: "18ec53-q3",
        module: 3,
        part: "Part A",
        question: "Define White Noise. Show that when white noise passes through an ideal lowpass filter, the output noise power is proportional to the filter bandwidth.",
        concept: "White Noise LPF Power",
        marks: 8,
        years: [2021, 2023, 2025],
        sessions: ["2021-R", "2023-S", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 3,
        predictedRecurrence: 76,
        description: "Highly fundamental probability theory and PSD integration."
      }
    ]
  },
  {
    id: "vtu-ece-5-18-54",
    name: "Information Theory & Coding",
    code: "18EC54",
    semester: 5,
    branch: "ECE",
    scheme: "2018",
    university: "VTU",
    modules: [
      { number: 1, title: "Information Measure & Source Coding", description: "Introduction, self-information, average information (entropy), information rate, Shannon's source coding theorem, Shannon-Fano, Huffman coding." },
      { number: 2, title: "Information Channels & Capacity", description: "Joint & conditional entropy, mutual information, channel capacity, symmetric and binary symmetric channels (BSC), Shannon-Hartley law." },
      { number: 3, title: "Error Control Coding - Linear Block Codes", description: "Introduction to error control, matrix representation of linear block codes, generator matrix, parity-check matrix, syndrome decoding, error correction." },
      { number: 4, title: "Cyclic Codes", description: "Algebraic structure of cyclic codes, generator polynomial, systematic cyclic codes, encoder and decoder for cyclic codes using feedback shift registers." },
      { number: 5, title: "Convolutional Codes & BCH Codes", description: "Convolutional encoder, connection pictorial representations (state diagram, tree, trellis), Viterbi decoding algorithm, BCH codes overview." }
    ],
    questions: [
      {
        id: "18ec54-q1",
        module: 1,
        part: "Part A",
        question: "A discrete memoryless source emits symbols S = {s1, s2, s3, s4, s5} with probabilities P = {0.4, 0.2, 0.2, 0.1, 0.1}. Apply Huffman coding to find the binary code, average code length, and entropy-efficiency of the code.",
        concept: "Huffman Source Coding",
        marks: 12,
        years: [2021, 2022, 2023, 2024, 2025],
        sessions: ["2021-R", "2022-R", "2023-R", "2024-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 5,
        predictedRecurrence: 98,
        description: "100% Guaranteed numerical in Module 1. Draw coding tree from right to left merging lowest probabilities, calculate code length L and efficiency eta."
      },
      {
        id: "18ec54-q2",
        module: 2,
        part: "Part A",
        question: "Define Mutual Information. Prove that I(X;Y) = H(X) - H(X|Y) and show that mutual information is always non-negative.",
        concept: "Mutual Information Proofs",
        marks: 8,
        years: [2021, 2022, 2024],
        sessions: ["2021-S", "2022-S", "2024-R"],
        difficulty: "Medium",
        repeatedCount: 3,
        predictedRecurrence: 81,
        description: "Standard theoretical proof. Venn diagram representing relationship between entropy and mutual information is highly recommended."
      },
      {
        id: "18ec54-q3",
        module: 3,
        part: "Part A",
        question: "The generator matrix for a (6,3) linear block code is G = [1 0 0 1 1 0; 0 1 0 0 1 1; 0 0 1 1 0 1]. Find: i) Generator parity matrix, ii) Parity check matrix H, iii) All codewords, and iv) Syndrome for received vector r = [0 0 1 1 1 0].",
        concept: "Linear Block Codes Matrix Solving",
        marks: 12,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-R", "2023-S", "2025-R"],
        difficulty: "Hard",
        repeatedCount: 4,
        predictedRecurrence: 92,
        description: "Standard matrix-based coding solver. Keep your binary addition modulo-2 correct."
      },
      {
        id: "18ec54-q4",
        module: 4,
        part: "Part A",
        question: "For a (7,4) cyclic code, the generator polynomial is g(x) = x^3 + x + 1. Find the systematic codeword for message vector d = [1 0 1 1] using polynomial division.",
        concept: "Cyclic Codes Polynomial Division",
        marks: 10,
        years: [2021, 2023, 2024, 2025],
        sessions: ["2021-S", "2023-R", "2024-S", "2025-S"],
        difficulty: "Hard",
        repeatedCount: 4,
        predictedRecurrence: 85,
        description: "Core polynomial math. Systematic means c(x) = d(x)*x^3 + rem[d(x)*x^3 / g(x)]."
      },
      {
        id: "18ec54-q5",
        module: 5,
        part: "Part A",
        question: "Consider a convolutional encoder with rate r=1/2 and constraint length K=3, defined by generator sequences g1 = (1,1,1) and g2 = (1,0,1). Sketch: i) Encoder block diagram, ii) Trellis diagram, and iii) Decoded sequence using Viterbi algorithm for received r = {11, 01, 01, 00}.",
        concept: "Convolutional Codes & Viterbi",
        marks: 12,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-S", "2023-R", "2025-R"],
        difficulty: "Hard",
        repeatedCount: 4,
        predictedRecurrence: 89,
        description: "Classic final module problem. Demands excellent drawing. Highlight survival paths in Viterbi trellis."
      }
    ]
  },
  {
    id: "vtu-ece-5-18-55",
    name: "Electromagnetic Waves",
    code: "18EC55",
    semester: 5,
    branch: "ECE",
    scheme: "2018",
    university: "VTU",
    modules: [
      { number: 1, title: "Coulomb's Law & Electric Fields", description: "Experimental law, Electric field intensity, Fields due to continuous charge distributions (line, sheet), Gauss's Law and its applications." },
      { number: 2, title: "Energy, Potential, and Poisson's Equation", description: "Energy spent in moving charge, Potential difference, Potential gradient, boundary conditions, Poisson's and Laplace's equations." },
      { number: 3, title: "Steady Magnetic Fields", description: "Biot-Savart Law, Ampere's Circuital Law, Curl, Stokes' Theorem, Magnetic flux and flux density, Magnetic forces and torques." },
      { number: 4, title: "Maxwell's Equations", description: "Faraday's Law, displacement current, Maxwell's equations in point form, integral form, boundary relations." },
      { number: 5, title: "Electromagnetic Wave Propagation", description: "Wave propagation in free space, wave propagation in dielectrics, Poynting vector and power flow, skin depth in good conductors." }
    ],
    questions: [
      {
        id: "18ec55-q1",
        module: 1,
        part: "Part A",
        question: "State Gauss's Law. Using Gauss's Law, derive the expression for the electric field intensity due to an infinite line charge of uniform density rho_L.",
        concept: "Gauss's Law Line Charge",
        marks: 8,
        years: [2021, 2022, 2024],
        sessions: ["2021-R", "2022-R", "2024-R"],
        difficulty: "Medium",
        repeatedCount: 3,
        predictedRecurrence: 83,
        description: "Highly standard derivation in Module 1. Choose a cylindrical Gaussian surface of radius r and length L."
      },
      {
        id: "18ec55-q2",
        module: 4,
        part: "Part A",
        question: "State Maxwell's equations in point (differential) and integral forms for time-varying electromagnetic fields.",
        concept: "Maxwell's Equations",
        marks: 10,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-S", "2022-S", "2023-R", "2025-R"],
        difficulty: "Hard",
        repeatedCount: 4,
        predictedRecurrence: 95,
        description: "100% repeating theoretical question. Must write down equations for general time-varying case, highlighting physical interpretation of displacement current."
      }
    ]
  },
  {
    id: "vtu-ece-5-18-56",
    name: "Verilog HDL",
    code: "18EC56",
    semester: 5,
    branch: "ECE",
    scheme: "2018",
    university: "VTU",
    modules: [
      { number: 1, title: "Overview of Digital Design", description: "Syllabus standard design flow, hierarchical modeling, modules and port definitions." },
      { number: 2, title: "Gate-Level Modeling", description: "Gate primitives, gate delays, rise/fall/turn-off delays, array of instances, examples (multiplexer, full adder)." },
      { number: 3, title: "Dataflow Modeling", description: "Continuous assignment statements, delay models, operators types, expression evaluations." },
      { number: 4, title: "Behavioral Modeling", description: "Structured procedures (initial, always), procedural assignments, timing controls, conditional loops (if-else, case, repeat, while, for)." },
      { number: 5, title: "Tasks, Functions & Synthesis", description: "Differences between tasks and functions, syntax, logic synthesis overview, gate netlist matching." }
    ],
    questions: [
      {
        id: "18ec56-q1",
        module: 2,
        part: "Part A",
        question: "Write a gate-level Verilog description of a 4-to-1 Multiplexer with gate delay parameters. Draw the schematic corresponding to it.",
        concept: "Gate-Level multiplexer Verilog",
        marks: 8,
        years: [2021, 2022, 2024],
        sessions: ["2021-R", "2022-R", "2024-R"],
        difficulty: "Medium",
        repeatedCount: 3,
        predictedRecurrence: 82,
        description: "Standard coding question in Module 2. Use primitives: and, or, not."
      },
      {
        id: "18ec56-q2",
        module: 4,
        part: "Part A",
        question: "Explain the difference between Blocking (=) and Non-Blocking (<=) procedural assignments with clear code examples and simulation timelines.",
        concept: "Blocking vs Non-Blocking Assignments",
        marks: 8,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-S", "2022-S", "2023-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 4,
        predictedRecurrence: 92,
        description: "Extremely popular interview and exam question. Blocking assignments happen sequentially; non-blocking happen concurrently at the end of the time step."
      }
    ]
  },

  // ==========================================
  // VTU -> 2021/2022 Scheme -> ECE -> Semester 5
  // ==========================================
  {
    id: "vtu-ece-5-dc",
    name: "Digital Communication",
    code: "21EC51",
    semester: 5,
    branch: "ECE",
    scheme: "2021",
    university: "VTU",
    modules: [
      { number: 1, title: "Signal Representation & Incoherent Receiver", description: "Geometric representation of signals, Gram-Schmidt orthogonalization, Matched filter, Coherent/Incoherent reception." },
      { number: 2, title: "Pulse Modulation & Waveform Coding", description: "Sampling theorem, Pulse Code Modulation (PCM), Quantization noise, Delta Modulation (DM), ADM." },
      { number: 3, title: "Baseband Shaping & Line Coding", description: "Intersymbol Interference (ISI), Nyquist criterion for zero ISI, Duo-binary signaling, Raised cosine spectrum." },
      { number: 4, title: "Digital Modulation Techniques", description: "ASK, FSK, PSK, DPSK, QPSK, MSK schemes, Constellation diagrams, Probability of error calculations." },
      { number: 5, title: "Spread Spectrum & Multiuser Systems", description: "Direct Sequence Spread Spectrum (DSSS), Frequency Hopping Spread Spectrum (FHSS), CDMA, PN sequences." }
    ],
    questions: [
      {
        id: "dc-q1",
        module: 1,
        part: "Part A",
        question: "Explain the Gram-Schmidt Orthogonalization procedure to find orthonormal basis functions for a given set of energy signals. Provide steps clearly.",
        concept: "Gram-Schmidt Orthogonalization",
        marks: 10,
        years: [2021, 2022, 2024],
        sessions: ["2021-R", "2022-R", "2024-R"],
        difficulty: "Hard",
        repeatedCount: 3,
        predictedRecurrence: 75,
        description: "Core derivation in Module 1. Usually asked in Part A of the first module. Make sure to draw the correlator blocks."
      },
      {
        id: "dc-q1b",
        module: 1,
        part: "Part B",
        question: "Derive the expression for the impulse response of a Matched Filter. Show that the maximum output SNR is proportional to the energy of the signal.",
        concept: "Matched Filter SNR",
        marks: 10,
        years: [2021, 2023, 2025],
        sessions: ["2021-S", "2023-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 3,
        predictedRecurrence: 80,
        description: "Standard Part B choice for Module 1. Requires Schwarz inequality substitution."
      },
      {
        id: "dc-q2",
        module: 2,
        part: "Part A",
        question: "Explain the block diagram of Pulse Code Modulation (PCM) transmitter and receiver in detail.",
        concept: "Pulse Code Modulation (PCM)",
        marks: 10,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-R", "2023-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 4,
        predictedRecurrence: 92,
        description: "Extremely high probability. Always asked in Part A of Module 2. Standard diagram-based scoring questions."
      },
      {
        id: "dc-q2b",
        module: 2,
        part: "Part B",
        question: "What is Delta Modulation? With a neat diagram and waveform, explain transmitter and receiver. Explain slope overload distortion and granular noise.",
        concept: "Delta Modulation (DM)",
        marks: 10,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-S", "2022-S", "2023-S", "2025-S"],
        difficulty: "Medium",
        repeatedCount: 4,
        predictedRecurrence: 88,
        description: "Part B alternative for Module 2. Must detail both distortion types with their respective formulas and corrective measures."
      }
    ]
  },

  // ==========================================
  // VTU -> 2018 Scheme -> CSE -> Semester 5
  // ==========================================
  {
    id: "vtu-cse-5-18-51",
    name: "Management and Entrepreneurship for IT Industry",
    code: "18CS51",
    semester: 5,
    branch: "CSE",
    scheme: "2018",
    university: "VTU",
    modules: [
      { number: 1, title: "Introduction to Management", description: "Basic concepts, Planning, Hierarchy, organizing structures in IT firms." },
      { number: 2, title: "Staffing, Directing and Controlling", description: "Recruitment methods, motivation models, technical leadership styles, budget controls." },
      { number: 3, title: "Social Responsibilities & Entrepreneurship", description: "Corporate social responsibility (CSR), Entrepreneurial growth, IT startups barriers." },
      { number: 4, title: "Small Scale Industries (SSIs)", description: "Government incentives, institutional assistance, micro/small enterprises definitions in IT." },
      { number: 5, title: "Project Preparation", description: "Project identification, Feasibility checks, preparation of IT startup project reports." }
    ],
    questions: [
      {
        id: "18cs51-q1",
        module: 1,
        part: "Part A",
        question: "Define Planning in IT firms. Explain the types of plans and the strategic planning processes in modern technology companies.",
        concept: "Strategic Planning in IT",
        marks: 10,
        years: [2021, 2022, 2024],
        sessions: ["2021-R", "2022-R", "2024-R"],
        difficulty: "Easy",
        repeatedCount: 3,
        predictedRecurrence: 77,
        description: "Core module 1 question. Highlight how agility in planning is critical for IT projects."
      }
    ]
  },
  {
    id: "vtu-cse-5-18-52",
    name: "Computer Networks and Security",
    code: "18CS52",
    semester: 5,
    branch: "CSE",
    scheme: "2018",
    university: "VTU",
    modules: [
      { number: 1, title: "Application Layer Protocols", description: "Principles of network applications, HTTP, SMTP, DNS, Socket programming." },
      { number: 2, title: "Transport Layer Services", description: "TCP connection control, congestion avoidance (AIMD), flow control, UDP." },
      { number: 3, title: "Network Layer Routing", description: "IP addressing, IPv4/IPv6, subnetting, Link-State and Distance-Vector routing algorithms." },
      { number: 4, title: "Wireless & Security Fundamentals", description: "Wireless links (802.11), Cryptography, RSA, Symmetric encryption." },
      { number: 5, title: "Network Security Protocols", description: "Digital Signatures, IPSec, Firewalls, Secure Email (PGP), TLS/SSL." }
    ],
    questions: [
      {
        id: "18cs52-q1",
        module: 2,
        part: "Part A",
        question: "Explain the TCP three-way handshake and connection release mechanism in detail with proper sequence numbers.",
        concept: "TCP Handshake",
        marks: 10,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-R", "2023-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 4,
        predictedRecurrence: 92,
        description: "Highly repeated question. Sequence and state transition diagrams are mandatory."
      },
      {
        id: "18cs52-q2",
        module: 3,
        part: "Part A",
        question: "Consider a network topology. Trace Dijkstra's algorithm to find the shortest path from node U to all other nodes. Show step-by-step matrix table calculations.",
        concept: "Dijkstra Routing Algorithm",
        marks: 10,
        years: [2021, 2023, 2024],
        sessions: ["2021-S", "2023-R", "2024-R"],
        difficulty: "Hard",
        repeatedCount: 3,
        predictedRecurrence: 84,
        description: "Classic numerical. Show each routing iteration clearly to score full 10 marks."
      }
    ]
  },
  {
    id: "vtu-cse-5-18-53",
    name: "Database Management System",
    code: "18CS53",
    semester: 5,
    branch: "CSE",
    scheme: "2018",
    university: "VTU",
    modules: [
      { number: 1, title: "Introduction & ER Modeling", description: "Database characteristics, three-schema architecture, Entity-Relationship diagrams." },
      { number: 2, title: "Relational Model & SQL", description: "Relational algebra, integrity constraints, basic/nested SQL queries, joins." },
      { number: 3, title: "Database Design Theory", description: "Functional dependencies, Normalization (1NF, 2NF, 3NF, BCNF), multi-valued dependencies." },
      { number: 4, title: "Transaction Management", description: "Transaction states, ACID properties, schedule serializability, conflict serializability." },
      { number: 5, title: "Concurrency & Recovery", description: "Two-Phase Locking (2PL), lock-based deadlocks, ARIES recovery steps." }
    ],
    questions: [
      {
        id: "18cs53-q1",
        module: 3,
        part: "Part A",
        question: "What is Functional Dependency? Define 1NF, 2NF, and 3NF with a suitable relational schema and explain the decomposition process.",
        concept: "Normalization",
        marks: 12,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-R", "2023-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 4,
        predictedRecurrence: 91,
        description: "Essential database core. Outline prime vs non-prime attributes and dependencies."
      }
    ]
  },
  {
    id: "vtu-cse-5-18-54",
    name: "Automata Theory and Computability",
    code: "18CS54",
    semester: 5,
    branch: "CSE",
    scheme: "2018",
    university: "VTU",
    modules: [
      { number: 1, title: "Finite Automata", description: "DFA, NFA, equivalence, Minimization of DFA, applications of automata." },
      { number: 2, title: "Regular Languages", description: "Regular expressions, pumping lemma for regular languages, closure properties." },
      { number: 3, title: "Context-Free Grammars (CFG) & PDA", description: "CFG, derivation trees, ambiguity, Pushdown Automata, equivalence." },
      { number: 4, title: "Turing Machines", description: "Standard TM model, multi-tape, programming techniques for TM." },
      { number: 5, title: "Decidability & Complexity", description: "Decidable vs Undecidable problems, Halting problem, Post Correspondence Problem." }
    ],
    questions: [
      {
        id: "18cs54-q1",
        module: 1,
        part: "Part A",
        question: "Design a DFA that accepts strings over {a, b} containing odd number of a's and even number of b's. Draw the transition table and transition graph.",
        concept: "DFA Design",
        marks: 8,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-R", "2023-S", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 4,
        predictedRecurrence: 88,
        description: "Highly repeating numerical in Module 1. Build the four-state transition table perfectly."
      },
      {
        id: "18cs54-q2",
        module: 2,
        part: "Part A",
        question: "State and prove Pumping Lemma for Regular Languages. Show that language L = {a^n b^n | n >= 0} is not regular.",
        concept: "Pumping Lemma Regular",
        marks: 10,
        years: [2021, 2022, 2024],
        sessions: ["2021-S", "2022-S", "2024-R"],
        difficulty: "Hard",
        repeatedCount: 3,
        predictedRecurrence: 82,
        description: "Must-know proof. Use contradiction by selecting a word 'w' and splitting into 'xyz' satisfying constraints."
      }
    ]
  },

  // ==========================================
  // VTU -> 2021 Scheme -> CSE -> Semester 5
  // ==========================================
  {
    id: "vtu-cse-5-dbms",
    name: "Database Management Systems",
    code: "21CS53",
    semester: 5,
    branch: "CSE",
    scheme: "2021",
    university: "VTU",
    modules: [
      { number: 1, title: "Introduction and Entity-Relationship Model", description: "Database characteristics, three-schema architecture, ER modeling, concepts of keys." },
      { number: 2, title: "Relational Model and SQL", description: "Relational constraints, schema, relational algebra, SQL data definition and queries." },
      { number: 3, title: "SQL Advanced & Relational Database Design", description: "Assertions, triggers, views, functional dependencies, normal forms (1NF, 2NF, 3NF, BCNF)." },
      { number: 4, title: "Transaction Processing Concepts", description: "ACID properties, schedules, serializability, conflict and view serializability." },
      { number: 5, title: "Concurrency Control & Recovery", description: "Two-Phase Locking (2PL), deadlocks, timestamp ordering, ARIES recovery algorithm." }
    ],
    questions: [
      {
        id: "dbms-q1",
        module: 1,
        part: "Part A",
        question: "Explain the three-schema architecture of DBMS with a neat diagram. Define data independence and explain its two main types.",
        concept: "Three-Schema Architecture",
        marks: 8,
        years: [2021, 2022, 2023, 2024],
        sessions: ["2021-R", "2022-R", "2023-R", "2024-R"],
        difficulty: "Easy",
        repeatedCount: 4,
        predictedRecurrence: 94,
        description: "Standard question in Part A of Module 1. Draw physical, conceptual, and external schema layers with physical/logical links."
      }
    ]
  },
  {
    id: "vtu-cse-5-cn",
    name: "Computer Networks",
    code: "21CS52",
    semester: 5,
    branch: "CSE",
    scheme: "2021",
    university: "VTU",
    modules: [
      { number: 1, title: "Application Layer", description: "Principles of network applications, Web/HTTP, FTP, SMTP, DNS, Peer-to-Peer file sharing." },
      { number: 2, title: "Transport Layer", description: "Multiplexing/Demultiplexing, Connectionless UDP, Reliable Data Transfer principles, Connection-oriented TCP, Congestion Control." },
      { number: 3, title: "Network Layer", description: "Virtual circuit and datagram networks, Router internal structure, IPv4 and IPv6 addressing, Routing algorithms (Dijkstra, Distance Vector)." },
      { number: 4, title: "Wireless & Mobile Networks", description: "Wireless links (WiFi 802.11), cellular networks (LTE, 5G), mobile IP routing." },
      { number: 5, title: "Network Security & Multimedia", description: "Cryptography principles, Symmetric/Asymmetric key systems (RSA, AES), Firewalls, secure e-mail (PGP), TLS." }
    ],
    questions: [
      {
        id: "cn-q1",
        module: 2,
        part: "Part A",
        question: "Explain the three-way handshake connection establishment and connection teardown (four-way wave) processes in TCP with a neat sequence exchange diagram.",
        concept: "TCP Handshake Connection Control",
        marks: 10,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-R", "2023-R", "2025-R"],
        difficulty: "Medium",
        repeatedCount: 4,
        predictedRecurrence: 93,
        description: "Standard Part A selection in Module 2. Must list syn-packet numbers, ack-packet numbers, and sequence numbers."
      }
    ]
  },

  // ==========================================
  // ANNA University -> 2021 Scheme -> CSE -> Semester 5
  // ==========================================
  {
    id: "anna-cse-5-os",
    name: "Operating Systems",
    code: "CS3451",
    semester: 5,
    branch: "CSE",
    scheme: "2021",
    university: "ANNA",
    modules: [
      { number: 1, title: "Operating Systems Overview", description: "Computer System organization, OS operations, System calls, process concept." },
      { number: 2, title: "CPU Scheduling & Synchronization", description: "CPU schedulers, FCFS, SJF, Priority, Round Robin scheduling. Critical section problem, Semaphores." },
      { number: 3, title: "Memory Management", description: "Paging, segmentation, Virtual memory, page replacement algorithms (FIFO, LRU, Optimal)." },
      { number: 4, title: "Storage Management", description: "File structures, access methods, Disk scheduling algorithms (FCFS, SSTF, SCAN, LOOK)." },
      { number: 5, title: "Deadlocks & Case Studies", description: "Deadlock prevention, avoidance (Banker's algorithm), detection, recovery, Linux case studies." }
    ],
    questions: [
      {
        id: "os-q1",
        module: 2,
        part: "Part A",
        question: "Define Peterson's solution for the Critical Section problem. Explain how it fulfills all three requirements of Mutual Exclusion, Progress, and Bounded Waiting.",
        concept: "Critical Section & Peterson's Solution",
        marks: 8,
        years: [2021, 2022, 2023, 2025],
        sessions: ["2021-R", "2022-R", "2023-R", "2025-R"],
        difficulty: "Hard",
        repeatedCount: 4,
        predictedRecurrence: 89,
        description: "Module 2 Part A. Essential theoretical proof for synchronization."
      }
    ]
  }
];
