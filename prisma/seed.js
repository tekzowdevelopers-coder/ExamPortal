const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Tekzow Exam Portal database...");

  // 1. Seed Admin
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@tekzow.com" },
    update: {
      passwordHash: adminPasswordHash,
      name: "Tekzow Administrator",
    },
    create: {
      name: "Tekzow Administrator",
      email: "admin@tekzow.com",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✓ Admin created:", admin.email);

  // 2. Seed Initial Machine Learning Course
  const course = await prisma.course.upsert({
    where: { courseCode: "ML15" },
    update: {
      courseName: "Machine Learning",
      description: "15-Hour Comprehensive Machine Learning Assessment & Certification Program covering AI/ML fundamentals, data preprocessing, regression, classification, ensembles, evaluation metrics, and unsupervised clustering.",
      duration: "15 Hours",
      trainerName: "Sankar K",
      trainerDesignation: "AI Trainer",
      status: "PUBLISHED",
    },
    create: {
      courseName: "Machine Learning",
      courseCode: "ML15",
      description: "15-Hour Comprehensive Machine Learning Assessment & Certification Program covering AI/ML fundamentals, data preprocessing, regression, classification, ensembles, evaluation metrics, and unsupervised clustering.",
      duration: "15 Hours",
      trainerName: "Sankar K",
      trainerDesignation: "AI Trainer",
      status: "PUBLISHED",
    },
  });
  console.log("✓ Course created:", course.courseName, `(${course.courseCode})`);

  // 3. Seed Exam
  let exam = await prisma.exam.findFirst({
    where: { courseId: course.id, title: "Machine Learning Final Assessment" },
  });

  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        courseId: course.id,
        title: "Machine Learning Final Assessment",
        duration: 60,
        totalQuestions: 30,
        marksPerQuestion: 1.0,
        negativeMark: 0.0,
        passingPercentage: 50.0,
        status: "PUBLISHED",
        randomizeQuestions: true,
        randomizeOptions: true,
        showResultImmediately: true,
        showCorrectAnswers: true,
        allowReview: true,
        fullscreenRequired: true,
        tabSwitchWarning: true,
        maxTabSwitches: 5,
        certificateGeneration: true,
      },
    });
  }
  console.log("✓ Exam configured:", exam.title);

  // 4. Seed Comprehensive Machine Learning Question Bank (36 questions across all 9 curriculum areas)
  const questionsData = [
    // --- FUNDAMENTALS ---
    {
      topic: "Machine Learning Fundamentals",
      difficulty: "EASY",
      question: "Which type of Machine Learning algorithm uses labeled training data to learn mapping from inputs to outputs?",
      optionA: "Unsupervised Learning",
      optionB: "Supervised Learning",
      optionC: "Reinforcement Learning",
      optionD: "Self-Supervised Clustering",
      correctAnswer: "B",
      explanation: "Supervised learning algorithms are trained using labeled datasets where both features and target ground truth values are provided.",
    },
    {
      topic: "Machine Learning Fundamentals",
      difficulty: "EASY",
      question: "What is the variable in a dataset that the model attempts to predict called?",
      optionA: "Feature",
      optionB: "Hyperparameter",
      optionC: "Target or Label",
      optionD: "Weight",
      correctAnswer: "C",
      explanation: "The target (or label/dependent variable) is the output variable the machine learning model is trained to predict.",
    },
    {
      topic: "Machine Learning Fundamentals",
      difficulty: "MEDIUM",
      question: "In Machine Learning terminology, what distinguishes Deep Learning from traditional Machine Learning?",
      optionA: "Deep learning requires manual feature extraction for every task",
      optionB: "Deep learning utilizes multi-layered artificial neural networks capable of automatic feature hierarchy learning",
      optionC: "Deep learning can only run on tabular CSV data",
      optionD: "Deep learning algorithms never require training data",
      correctAnswer: "B",
      explanation: "Deep learning is a subset of ML based on multi-layered artificial neural networks that can learn hierarchical feature representations directly from raw data.",
    },
    {
      topic: "Machine Learning Fundamentals",
      difficulty: "EASY",
      question: "Which step in the ML workflow transforms a trained mathematical model into practical predictions on unseen data?",
      optionA: "Inference / Prediction",
      optionB: "Data Imputation",
      optionC: "Gradient Descent",
      optionD: "Cross-Entropy loss",
      correctAnswer: "A",
      explanation: "Inference or prediction is the stage where the deployed, trained model takes new, unseen input data and outputs predicted values.",
    },

    // --- PYTHON & DATA HANDLING ---
    {
      topic: "Python & Data Libraries",
      difficulty: "EASY",
      question: "Which Python library is specifically optimized for high-performance multidimensional array operations and vectorization?",
      optionA: "Pandas",
      optionB: "NumPy",
      optionC: "Matplotlib",
      optionD: "Seaborn",
      correctAnswer: "B",
      explanation: "NumPy (Numerical Python) is the core library in Python for fast multidimensional array processing and vectorized numerical computations.",
    },
    {
      topic: "Python & Data Libraries",
      difficulty: "MEDIUM",
      question: "In Pandas, which method is commonly used to inspect summary statistics (mean, std, min, quartiles, max) for numerical columns?",
      optionA: "df.info()",
      optionB: "df.describe()",
      optionC: "df.summary()",
      optionD: "df.shape()",
      correctAnswer: "B",
      explanation: "df.describe() produces descriptive summary statistics including count, mean, standard deviation, and percentiles for numerical columns.",
    },
    {
      topic: "Python & Data Libraries",
      difficulty: "EASY",
      question: "What is the primary difference between a Python List and a NumPy ndarray?",
      optionA: "Python lists can hold heterogeneous data types, while NumPy arrays require homogeneous elements for optimal memory performance",
      optionB: "NumPy arrays are slower than native Python lists",
      optionC: "Python lists support multidimensional matrix multiplication natively",
      optionD: "NumPy arrays cannot be sliced or indexed",
      correctAnswer: "A",
      explanation: "NumPy arrays store homogeneous data in contiguous memory blocks, enabling SIMD vectorization and superior mathematical speed compared to Python generic lists.",
    },
    {
      topic: "Python & Data Libraries",
      difficulty: "MEDIUM",
      question: "In Pandas, which function is used to locate and access DataFrame rows and columns by integer-based index positions?",
      optionA: "df.loc[]",
      optionB: "df.iloc[]",
      optionC: "df.index[]",
      optionD: "df.at_label[]",
      correctAnswer: "B",
      explanation: "df.iloc[] provides purely integer-location based indexing, whereas df.loc[] is label-based indexing.",
    },

    // --- DATA PREPROCESSING ---
    {
      topic: "Data Preprocessing",
      difficulty: "MEDIUM",
      question: "Why should StandardScaler fit parameters (mean and standard deviation) only be learned from the training set and NOT the test set?",
      optionA: "To reduce computing time and memory usage",
      optionB: "To prevent data leakage from the test distribution into the model training pipeline",
      optionC: "Because scikit-learn does not allow fitting on test sets",
      optionD: "Because test sets are always normalized to zero automatically",
      correctAnswer: "B",
      explanation: "Fitting transformers on the test set causes data leakage, artificially inflating validation performance by exposing test distribution statistics to training.",
    },
    {
      topic: "Data Preprocessing",
      difficulty: "EASY",
      question: "Which encoding technique converts a categorical variable with N unordered categories into N binary columns?",
      optionA: "Label Encoding",
      optionB: "One-Hot Encoding",
      optionC: "Ordinal Encoding",
      optionD: "Binary Search Encoding",
      correctAnswer: "B",
      explanation: "One-Hot Encoding creates a new binary (0/1) column for each distinct category, preventing the model from assuming false ordinal ranking.",
    },
    {
      topic: "Data Preprocessing",
      difficulty: "MEDIUM",
      question: "Which technique is most appropriate for handling missing values in numerical columns when extreme outliers are present in the dataset?",
      optionA: "Mean imputation",
      optionB: "Median imputation",
      optionC: "Zero filling",
      optionD: "Random number assignment",
      correctAnswer: "B",
      explanation: "The median is robust to outliers, making median imputation much safer than mean imputation when skewed distributions or extreme values exist.",
    },
    {
      topic: "Data Preprocessing",
      difficulty: "EASY",
      question: "What is the typical standard ratio split used for separating a dataset into training and testing sets?",
      optionA: "10% train, 90% test",
      optionB: "80% train, 20% test",
      optionC: "50% train, 50% test",
      optionD: "100% train, 0% test",
      correctAnswer: "B",
      explanation: "A common split ratio is 80/20 or 70/30, ensuring sufficient data for learning patterns while leaving an independent sample for reliable evaluation.",
    },

    // --- REGRESSION ---
    {
      topic: "Regression",
      difficulty: "EASY",
      question: "In Simple Linear Regression (y = mx + c), what does the parameter 'm' represent?",
      optionA: "The y-intercept",
      optionB: "The slope (coefficient) indicating the change in y per unit change in x",
      optionC: "The residual variance",
      optionD: "The learning rate",
      correctAnswer: "B",
      explanation: "In y = mx + c, m represents the slope or regression coefficient, which specifies the rate of change of the dependent variable with respect to the feature.",
    },
    {
      topic: "Regression",
      difficulty: "MEDIUM",
      question: "Which regression metric penalizes large prediction errors more severely due to squaring each individual residual?",
      optionA: "Mean Absolute Error (MAE)",
      optionB: "Mean Squared Error (MSE)",
      optionC: "R-squared (R²)",
      optionD: "Adjusted R²",
      correctAnswer: "B",
      explanation: "MSE squares the difference between true and predicted values before averaging, disproportionately penalizing large residual errors.",
    },
    {
      topic: "Regression",
      difficulty: "MEDIUM",
      question: "What does an R-squared (R²) value of 0.85 signify about a regression model?",
      optionA: "The model is 85% accurate on classification tasks",
      optionB: "85% of the variance in the dependent target variable is explained by the independent features in the model",
      optionC: "The error rate of the model is 15%",
      optionD: "The model will misclassify 15 out of 100 points",
      correctAnswer: "B",
      explanation: "R² (coefficient of determination) measures the proportion of total variance in the dependent variable explained by the regression model.",
    },
    {
      topic: "Regression",
      difficulty: "HARD",
      question: "What happens when you fit a high-degree Polynomial Regression model to a small dataset?",
      optionA: "The model suffers from high bias and underfits",
      optionB: "The model suffers from high variance and overfits, capturing noise instead of the true underlying function",
      optionC: "The model automatically simplifies to linear regression",
      optionD: "The training MSE increases significantly",
      correctAnswer: "B",
      explanation: "High-degree polynomials have excessive flexibility and degrees of freedom, causing high variance and overfitting on limited training samples.",
    },

    // --- CLASSIFICATION ---
    {
      topic: "Classification",
      difficulty: "MEDIUM",
      question: "What mathematical activation function does Logistic Regression use to map real numbers into a probability range between 0 and 1?",
      optionA: "ReLU function",
      optionB: "Sigmoid (Logistic) function",
      optionC: "Step function",
      optionD: "Softplus function",
      correctAnswer: "B",
      explanation: "The sigmoid function σ(z) = 1 / (1 + e^(-z)) maps any real input value into the (0, 1) probability interval.",
    },
    {
      topic: "Classification",
      difficulty: "EASY",
      question: "In the K-Nearest Neighbors (KNN) algorithm, what does the parameter 'K' represent?",
      optionA: "The number of training clusters",
      optionB: "The number of nearest neighboring data points consulted for majority voting",
      optionC: "The number of input features",
      optionD: "The learning rate multiplier",
      correctAnswer: "B",
      explanation: "In KNN, K specifies the number of closest historical data instances in feature space used to determine the class assignment or predicted value.",
    },
    {
      topic: "Classification",
      difficulty: "MEDIUM",
      question: "What splitting criteria can be used by Decision Tree algorithms to choose the best feature at each node?",
      optionA: "Gini Impurity and Entropy (Information Gain)",
      optionB: "Euclidean and Manhattan Distance",
      optionC: "Eigenvalue and Eigenvector variance",
      optionD: "L1 Norm and L2 Norm",
      correctAnswer: "A",
      explanation: "Classification Decision Trees commonly evaluate splits using Gini Impurity (CART) or Entropy / Information Gain (ID3, C4.5).",
    },
    {
      topic: "Classification",
      difficulty: "HARD",
      question: "Why is feature scaling essential before training a distance-based classifier such as KNN or SVM with RBF kernel?",
      optionA: "Because unscaled features cause infinite loops in matrix factorization",
      optionB: "Features with large numerical scales will disproportionately dominate distance calculations over smaller-scale features",
      optionC: "Because decision trees cannot split without normalized features",
      optionD: "Scaling removes categorical features automatically",
      correctAnswer: "B",
      explanation: "Distance metrics (such as Euclidean distance) are sensitive to magnitudes. A feature ranging 0-100,000 will overwhelm a feature ranging 0-1 unless properly scaled.",
    },

    // --- ENSEMBLE MODELS ---
    {
      topic: "Ensemble Models",
      difficulty: "MEDIUM",
      question: "Which ensemble technique builds multiple independent decision trees in parallel using bootstrap samples and feature subsampling?",
      optionA: "Gradient Boosting",
      optionB: "Random Forest (Bagging)",
      optionC: "AdaBoost",
      optionD: "Stacking",
      correctAnswer: "B",
      explanation: "Random Forest implements Bootstrap Aggregating (Bagging) combined with random feature subsets to train independent trees and average their predictions.",
    },
    {
      topic: "Ensemble Models",
      difficulty: "HARD",
      question: "What is the fundamental difference between Bagging and Boosting?",
      optionA: "Bagging trains base estimators sequentially, while Boosting trains them independently in parallel",
      optionB: "Bagging trains independent base estimators in parallel to reduce variance, while Boosting trains models sequentially to correct earlier errors and reduce bias",
      optionC: "Bagging only works for regression, whereas Boosting only works for classification",
      optionD: "Boosting uses random forests as its only base learner",
      correctAnswer: "B",
      explanation: "Bagging trains parallel models on bootstrap samples to reduce variance. Boosting trains sequential models where each successive model focuses on mistakes made by earlier estimators.",
    },
    {
      topic: "Ensemble Models",
      difficulty: "MEDIUM",
      question: "What makes XGBoost (Extreme Gradient Boosting) exceptionally popular in competitive machine learning?",
      optionA: "It does not require any hyperparameters to be tuned",
      optionB: "It incorporates regularized objective functions, second-order Taylor expansion gradients, and parallel tree pruning",
      optionC: "It is an unsupervised clustering algorithm",
      optionD: "It runs without requiring any memory",
      correctAnswer: "B",
      explanation: "XGBoost offers built-in L1/L2 regularization, exact and approximate split finding, 2nd-order gradients, and hardware-optimized parallel execution.",
    },
    {
      topic: "Ensemble Models",
      difficulty: "EASY",
      question: "What is the primary benefit of using an ensemble of models rather than a single decision tree?",
      optionA: "Ensembles guarantee 100% training accuracy",
      optionB: "Ensembles combine predictions from diverse models to yield superior generalization and reduced variance",
      optionC: "Ensembles train much faster than a single small tree",
      optionD: "Ensembles do not require any input data",
      correctAnswer: "B",
      explanation: "Ensemble methods aggregate the strengths of multiple estimators, stabilizing predictions and significantly reducing variance and overfitting.",
    },

    // --- MODEL EVALUATION ---
    {
      topic: "Model Evaluation",
      difficulty: "MEDIUM",
      question: "In an imbalanced medical diagnosis problem where missing a malignant disease is critical, which metric should be prioritized?",
      optionA: "Accuracy",
      optionB: "Recall (Sensitivity)",
      optionC: "Specificity",
      optionD: "L2 Penalty",
      correctAnswer: "B",
      explanation: "Recall = TP / (TP + FN). Maximizing recall minimizes False Negatives (FN), ensuring patients with the condition are not missed.",
    },
    {
      topic: "Model Evaluation",
      difficulty: "MEDIUM",
      question: "What is the formula for the F1-Score in binary classification?",
      optionA: "F1 = (Precision + Recall) / 2",
      optionB: "F1 = 2 * (Precision * Recall) / (Precision + Recall)",
      optionC: "F1 = (True Positives + True Negatives) / Total Samples",
      optionD: "F1 = Precision * Recall",
      correctAnswer: "B",
      explanation: "The F1-Score is the harmonic mean of Precision and Recall: 2 * (P * R) / (P + R), punishing models that achieve high precision at the expense of dismal recall or vice versa.",
    },
    {
      topic: "Model Evaluation",
      difficulty: "EASY",
      question: "In a Confusion Matrix, what does a 'False Positive' (Type I Error) represent?",
      optionA: "A positive case correctly predicted as positive",
      optionB: "A negative case correctly predicted as negative",
      optionC: "A negative instance incorrectly predicted as positive",
      optionD: "A positive instance incorrectly predicted as negative",
      correctAnswer: "C",
      explanation: "A False Positive occurs when the true actual label is negative, but the model incorrectly classifies it as positive (false alarm).",
    },
    {
      topic: "Model Evaluation",
      difficulty: "MEDIUM",
      question: "Why is raw Accuracy often misleading for evaluating models on skewed or imbalanced datasets?",
      optionA: "Accuracy can only be computed for regression models",
      optionB: "A trivial baseline model predicting only the majority class can yield high accuracy while failing to identify minority class cases",
      optionC: "Accuracy is always equal to 0 on balanced datasets",
      optionD: "Accuracy requires continuous probability scores",
      correctAnswer: "B",
      explanation: "In a dataset with 99% negative cases, a dummy classifier predicting 'negative' for every row has 99% accuracy but 0% recall for positive events.",
    },

    // --- ADVANCED CONCEPTS & TUNING ---
    {
      topic: "Advanced ML Concepts",
      difficulty: "HARD",
      question: "What is the classic symptom of a Machine Learning model that is suffering from severe Overfitting?",
      optionA: "High error on both training and test sets",
      optionB: "Near-zero training error accompanied by significantly higher error on test/validation data",
      optionC: "Identical loss on both training and test data",
      optionD: "Flat loss curve that never updates during epochs",
      correctAnswer: "B",
      explanation: "Overfitting occurs when a model memorizes idiosyncrasies and noise in the training set (low training error) but fails to generalize to unseen test samples (high generalization error).",
    },
    {
      topic: "Advanced ML Concepts",
      difficulty: "MEDIUM",
      question: "How does K-Fold Cross-Validation provide a more dependable estimate of model performance than a single train/test split?",
      optionA: "It trains the model once on 100% of the data without testing",
      optionB: "It partitions the dataset into K folds, iteratively training on K-1 folds and validating on the remaining fold to average performance across all data",
      optionC: "It eliminates the need for any evaluation metrics",
      optionD: "It creates duplicate synthetic records automatically",
      correctAnswer: "B",
      explanation: "K-Fold Cross-Validation ensures that every observation is used for validation once, reducing sampling variance and giving an honest estimate of generalization.",
    },
    {
      topic: "Advanced ML Concepts",
      difficulty: "HARD",
      question: "What is the key difference between L1 (Lasso) and L2 (Ridge) Regularization?",
      optionA: "L1 adds squared weights penalty; L2 adds absolute weights penalty",
      optionB: "L1 (Lasso) penalizes the sum of absolute coefficients and can shrink weights to exact zero (performing feature selection), whereas L2 penalizes squared coefficients",
      optionC: "Ridge regularization causes models to overfit more than unregularized models",
      optionD: "Lasso cannot be used with linear regression",
      correctAnswer: "B",
      explanation: "Lasso (L1) uses the Manhattan norm, driving irrelevant coefficients exactly to zero (sparse solutions for feature selection). Ridge (L2) shrinks coefficients smoothly toward zero.",
    },
    {
      topic: "Advanced ML Concepts",
      difficulty: "MEDIUM",
      question: "In Hyperparameter Optimization, how does RandomizedSearchCV differ from GridSearchCV?",
      optionA: "GridSearchCV evaluates an arbitrary random selection of parameters, while RandomizedSearchCV tests all combinations",
      optionB: "GridSearchCV exhaustively tests every combination in a defined parameter grid, while RandomizedSearchCV samples a fixed number of combinations randomly",
      optionC: "RandomizedSearchCV requires more computation time than GridSearchCV",
      optionD: "GridSearchCV only works with neural networks",
      correctAnswer: "B",
      explanation: "GridSearchCV exhaustively searches every possible combination in the parameter grid, while RandomizedSearchCV samples from specified probability distributions for faster exploration.",
    },

    // --- UNSUPERVISED LEARNING ---
    {
      topic: "Unsupervised Learning",
      difficulty: "MEDIUM",
      question: "In the K-Means clustering algorithm, how is the optimal number of clusters commonly identified visually?",
      optionA: "ROC curve inflection point",
      optionB: "The Elbow Method on a plot of Within-Cluster Sum of Squares (WCSS) vs K",
      optionC: "Precision-Recall frontier",
      optionD: "Confusion matrix diagonal values",
      correctAnswer: "B",
      explanation: "The Elbow Method plots WCSS (inertia) against candidate values of K; the 'elbow' point indicates diminishing returns in clustering compactness.",
    },
    {
      topic: "Unsupervised Learning",
      difficulty: "EASY",
      question: "What is the primary mathematical purpose of Principal Component Analysis (PCA)?",
      optionA: "To perform multi-class classification using neural networks",
      optionB: "To perform dimensionality reduction by projecting data onto orthogonal axes that maximize variance",
      optionC: "To impute missing values in time-series data",
      optionD: "To calculate classification accuracy on test sets",
      correctAnswer: "B",
      explanation: "PCA identifies orthogonal principal component directions along which the variance of the data is maximized, compressing high-dimensional datasets while retaining key variance.",
    },
    {
      topic: "Unsupervised Learning",
      difficulty: "HARD",
      question: "Why does the standard K-Means algorithm sometimes converge to a suboptimal local minimum rather than the global optimum?",
      optionA: "Because K-Means uses gradient boosting updates",
      optionB: "Because the algorithm is sensitive to initial random centroid placement (alleviated by K-Means++ initialization)",
      optionC: "Because K-Means only handles categorical data",
      optionD: "Because WCSS is always convex with infinite minima",
      correctAnswer: "B",
      explanation: "K-Means uses iterative expectation-maximization which can get trapped in local optima depending on initial cluster centroids. K-Means++ improves this by spreading initial centroids.",
    },
    {
      topic: "Unsupervised Learning",
      difficulty: "MEDIUM",
      question: "Which of the following is an example of an Unsupervised Learning application?",
      optionA: "Predicting house prices given square footage and location",
      optionB: "Classifying customer segments based on purchasing behaviors without prior labels",
      optionC: "Predicting whether an email is spam or non-spam using labeled messages",
      optionD: "Forecasting tomorrow's temperature from historical readings",
      correctAnswer: "B",
      explanation: "Customer segmentation without predefined group labels is an unsupervised clustering task that finds natural groupings based on feature similarity.",
    },
  ];

  // Delete existing questions for this course to avoid duplicate inflation during re-seeds
  await prisma.question.deleteMany({
    where: { courseId: course.id },
  });

  for (const q of questionsData) {
    await prisma.question.create({
      data: {
        courseId: course.id,
        examId: exam.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: 1.0,
        difficulty: q.difficulty,
        topic: q.topic,
      },
    });
  }

  const count = await prisma.question.count({ where: { courseId: course.id } });
  console.log(`✓ Seeded ${count} Machine Learning examination questions.`);
  console.log("🚀 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
