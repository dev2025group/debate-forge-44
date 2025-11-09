// Research papers data for AI Climate Modeling analysis

export const researchPapers = [
  {
    id: 1,
    title: "Deep Learning Approaches for High-Resolution Climate Prediction: A Controlled Laboratory Study",
    abstract: "This study evaluates state-of-the-art deep learning architectures for climate prediction using controlled laboratory simulations. We implemented and compared CNN, LSTM, and Transformer-based models on standardized climate datasets with known ground truth. Our approach leverages high-quality synthetic data to isolate model performance from real-world data quality issues.",
    keyFindings: "Achieved 94% accuracy in temperature prediction and 89% accuracy in precipitation forecasting. Models demonstrated strong performance on held-out test sets with minimal overfitting.",
    methodology: "Controlled laboratory study using synthetic climate data generated from established physical models. Training on 500,000 simulated climate scenarios with perfect ground truth labels.",
    results: "CNN-LSTM hybrid model achieved 94% temperature prediction accuracy, 89% precipitation accuracy, and processed predictions 3x faster than traditional numerical models. Mean absolute error of 0.8°C for 7-day forecasts.",
    limitations: "Results based on synthetic data only. Real-world performance not validated. Assumes ideal sensor conditions and data quality not representative of actual climate monitoring infrastructure.",
    year: 2024,
    source: "arXiv:2024.03451"
  },
  {
    id: 2,
    title: "Neural Networks for Climate Pattern Recognition: Simulation-Based Validation",
    abstract: "We present a comprehensive simulation study of neural network architectures for identifying climate patterns and anomalies. Using controlled computational experiments, we evaluate various deep learning approaches under ideal conditions to establish theoretical performance bounds.",
    keyFindings: "Demonstrated 91% accuracy in climate pattern classification and 87% precision in anomaly detection across multiple climate zones in simulated environments.",
    methodology: "Simulation-based study with curated datasets. Models trained on 1 million synthetic climate observations with balanced class distributions and no missing data.",
    results: "ResNet-based architecture achieved 91% pattern classification accuracy. Successfully identified 87% of known anomalies in test scenarios. Processing time: 0.05 seconds per forecast.",
    limitations: "Entirely simulation-based without field testing. Does not account for sensor noise, missing data, or edge cases common in real deployments. Computational requirements assume unlimited resources.",
    year: 2023,
    source: "arXiv:2023.08762"
  },
  {
    id: 3,
    title: "Real-World Deployment of AI Climate Models in Agricultural Regions",
    abstract: "This paper reports findings from a 24-month deployment of AI-based climate prediction systems across 15 agricultural regions in Southeast Asia. We document actual performance, implementation challenges, and practical limitations encountered in operational environments with real sensor networks and diverse geographical conditions.",
    keyFindings: "Models achieved 67% accuracy in precipitation forecasting and 71% accuracy in temperature prediction across diverse geographical conditions. Significant performance degradation observed compared to laboratory benchmarks.",
    methodology: "Real-world field deployment with operational sensor networks. Data collected from 150 weather stations over 24 months. Includes handling of sensor failures, missing data (23% of readings), and extreme weather events.",
    results: "Field-deployed models showed 67% precipitation accuracy and 71% temperature accuracy - notably lower than lab studies. System uptime: 78% due to connectivity issues. Maintenance required every 6 weeks. Cost per installation: $45,000.",
    limitations: "Limited to tropical and subtropical climates. High maintenance costs and technical expertise required for operation. Models struggled with extreme weather events outside training distribution. Data quality issues persist despite calibration efforts.",
    year: 2024,
    source: "Nature Climate Change, Vol. 14"
  },
  {
    id: 4,
    title: "Challenges in Operational AI Climate Forecasting: Lessons from Arctic Monitoring Stations",
    abstract: "A three-year study documenting the operational deployment of machine learning climate models in 12 Arctic monitoring stations. This research highlights practical challenges including harsh environmental conditions, sparse data infrastructure, and model performance under extreme conditions.",
    keyFindings: "Operational accuracy averaged 58% for precipitation and 64% for temperature in harsh Arctic conditions. Significant challenges with model reliability during polar night and equipment failures.",
    methodology: "Field study in extreme environments with limited infrastructure. Deployed autonomous AI systems in remote Arctic locations with satellite connectivity. Dataset includes 36 months of real-world observations with 31% missing data due to equipment issues.",
    results: "Deployed systems achieved 58% precipitation accuracy and 64% temperature accuracy. Model performance dropped 15-20% during polar night. Hardware failures occurred monthly. Average system downtime: 34 days per year. Total deployment cost: $1.2M for 12 stations.",
    limitations: "Extreme environment introduces unique challenges not applicable to temperate zones. High costs limit scalability. Models require frequent recalibration due to rapidly changing Arctic conditions. Limited technical support infrastructure in remote locations.",
    year: 2023,
    source: "Journal of Applied Meteorology and Climatology, Vol. 62"
  },
  {
    id: 5,
    title: "Hybrid AI-Physical Climate Modeling: Combining Simulation and Real-World Data",
    abstract: "This research explores hybrid approaches that combine traditional physics-based climate models with machine learning, evaluated through both controlled experiments and limited field trials. We investigate whether combining approaches can achieve better performance than either method alone.",
    keyFindings: "Hybrid approach achieved 78% accuracy in diverse climate conditions, balancing the high accuracy of lab studies with the robustness needed for real-world deployment.",
    methodology: "Hybrid study combining 200,000 simulated scenarios with 50,000 real-world observations from 8 monitoring stations. Models pre-trained on simulations then fine-tuned on field data over 18 months.",
    results: "Hybrid models achieved 78% overall accuracy (81% temperature, 75% precipitation). Performance more stable than pure ML approaches when encountering novel conditions. Reduced maintenance requirements to bi-monthly intervals. Deployment cost: $28,000 per station.",
    limitations: "Requires significant computational resources for physics simulations. Fine-tuning process takes 3-6 months per deployment. Still shows performance degradation in extreme weather. Limited testing in diverse climatic zones beyond initial 8 stations.",
    year: 2024,
    source: "Geoscientific Model Development, Vol. 17"
  }
];

export const getPaperById = (id) => researchPapers.find(p => p.id === id);
