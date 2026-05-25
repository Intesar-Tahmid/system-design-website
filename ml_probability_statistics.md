# ML Probability & Statistics
## 50 Questions — Beginner to Advanced
### For Machine Learning & AI Engineers

> Questions build on each other. Read in order. Each answer explains the concept from first principles, then connects it to how it appears in real ML work.

---

## Part 1 — Foundations (Q1–Q12)
*Core probability and statistics every ML engineer must be fluent in*

---

### Q1. What is the difference between probability and statistics?

**Answer:**

They are two sides of the same coin, but they go in opposite directions.

**Probability** starts with a known model and asks: what outcomes should we expect? You know a fair coin has a 50% chance of heads. Probability predicts what will happen before you observe anything.

**Statistics** starts with observed data and asks: what model produced this? You flipped a coin 1000 times and got 600 heads. Statistics infers that the coin is probably biased toward heads.

In machine learning, the relationship is: probability defines the model (how we believe data is generated), and statistics is how we estimate that model from the data we have.

**Example:** A spam classifier is a statistical model estimated from labeled emails. Probability theory describes how the model makes predictions. The training process is pure statistics — estimating model parameters from data. Inference at runtime is pure probability — computing P(spam | email features).

---

### Q2. What is a random variable and what are the types?

**Answer:**

A **random variable** is a variable whose value is determined by the outcome of a random process. It's a function that maps each outcome in a sample space to a number.

**Discrete random variable:** Takes countable values — integers, categories. The number of words in a sentence, the label of an email (spam=1, not spam=0), the number of users who clicked an ad.

**Continuous random variable:** Takes any value in a range. User session duration, a model's predicted probability score, a pixel intensity value, a person's height.

**Why this matters for ML:** Every feature in your dataset is a random variable. Your model's output is a random variable. Understanding the type tells you which probability distributions apply, which statistics are meaningful, and how to model it correctly.

You don't take the mean of a categorical variable (averaging "spam"=1 and "not spam"=0 gives 0.5, which means nothing). You don't draw a bar chart for a continuous variable. The type of random variable determines all the tools you use.

---

### Q3. What is a probability distribution and why is it central to ML?

**Answer:**

A **probability distribution** describes how probability is spread across the possible values of a random variable. It answers: how likely is each outcome?

**For discrete variables:** A probability mass function (PMF) assigns a probability to each possible value. Probabilities sum to 1.

**For continuous variables:** A probability density function (PDF) gives the relative likelihood at each point. The probability of a specific exact value is zero — you compute probabilities over intervals (areas under the curve).

**Why it's central to ML:**

Almost every ML algorithm makes assumptions about data distributions:
- Linear regression assumes errors are normally distributed.
- Logistic regression models P(class=1|features) — a Bernoulli distribution.
- Naive Bayes assumes features follow specific distributions (Gaussian, Multinomial).
- Neural networks learn to transform complex input distributions into simpler output distributions.

Understanding distributions lets you choose the right model, diagnose problems when your model's assumptions are violated, and know why certain models work on certain types of data.

---

### Q4. What is the normal (Gaussian) distribution and why does it appear everywhere?

**Answer:**

The **normal distribution** is a continuous, bell-shaped, symmetric probability distribution fully described by two parameters: mean (μ) — the center of the bell, and standard deviation (σ) — the width.

68% of values fall within 1σ of the mean. 95% within 2σ. 99.7% within 3σ. This is the empirical rule (68-95-99.7 rule).

**Why it appears everywhere — the Central Limit Theorem (CLT):**

The CLT states: The sum (or average) of a large number of independent random variables, regardless of their individual distributions, approaches a normal distribution. This is why:

- Measurement errors aggregate to a normal distribution (many small independent errors sum up).
- Heights, weights, IQ scores — influenced by many independent genetic and environmental factors — are approximately normal.
- The average of your model's predictions converges to normal behavior as sample size grows.

**In ML:**

- Many models assume normally distributed features. If your features are heavily skewed, transforming them (log transform, Box-Cox) before training helps.
- Gradient descent updates in neural networks can be analyzed through the lens of normal distributions.
- The Gaussian kernel is the most common kernel in SVMs and kernel density estimation.
- Neural network weight initialization (Xavier, Kaiming) uses normal distributions.
- Confidence intervals and hypothesis tests rely on normality assumptions.

---

### Q5. What is conditional probability and why is it the foundation of predictive ML?

**Answer:**

**Conditional probability** P(A|B) is the probability that event A occurs given that we already know event B has occurred. It's the probability of A in the restricted universe where B is true.

Formula: P(A|B) = P(A ∩ B) / P(B)

**Intuition:** You want to know if someone has a disease. P(disease) might be 1% in the general population. But if you know they have a positive test result, P(disease|positive test) is much higher. The condition changes your belief.

**Why it's the foundation of predictive ML:**

Every classification model estimates conditional probability. When your spam filter predicts "90% probability of spam," it's computing P(spam | this email's features). The entire goal of supervised learning is to learn P(label | features) from training data.

**Bayes' theorem** relates conditional probabilities:

P(A|B) = P(B|A) × P(A) / P(B)

In ML terms:
P(label|features) = P(features|label) × P(label) / P(features)

This is the basis of Naive Bayes classifiers and Bayesian ML broadly. But even non-Bayesian models (logistic regression, neural networks) are learning conditional probability distributions — they just estimate it differently.

---

### Q6. What is the expected value and variance of a distribution?

**Answer:**

**Expected value (E[X])** is the long-run average value of a random variable if you repeated the experiment infinitely. It's the "center of gravity" of the distribution.

For discrete: E[X] = Σ x × P(X=x) — sum each value times its probability.
For continuous: E[X] = ∫ x × f(x) dx — integral of value times density.

**Variance (Var[X])** measures how spread out the distribution is — the average squared deviation from the mean.

Var[X] = E[(X - E[X])²] = E[X²] - (E[X])²

**Standard deviation** = √Var[X] — same units as the variable itself, easier to interpret.

**Why this matters for ML:**

Expected value is what your model predicts in regression — the expected outcome given the input features. Mean Squared Error (MSE) = E[(prediction - actual)²] = a measure of variance of errors.

**Variance in ML context:** High variance in a model = overfitting (model is sensitive to random fluctuations in training data). This is the "variance" in the bias-variance trade-off. It's literally the statistical variance of the model's predictions across different training sets.

**Key properties:**
- E[aX + b] = aE[X] + b (linearity)
- Var[aX] = a² Var[X] (scaling)
- For independent X, Y: Var[X + Y] = Var[X] + Var[Y]

---

### Q7. What is Bayes' theorem and how does it work in ML?

**Answer:**

Bayes' theorem is the most important formula in probabilistic ML. It tells you how to update your beliefs in light of new evidence.

**P(hypothesis | evidence) = P(evidence | hypothesis) × P(hypothesis) / P(evidence)**

In ML terminology:
- **Prior P(hypothesis):** What you believed before seeing data. P(email is spam) = 20% based on historical rates.
- **Likelihood P(evidence | hypothesis):** How probable is this evidence if the hypothesis is true? P("free money" in email | spam) = 80%.
- **Posterior P(hypothesis | evidence):** Your updated belief after seeing the evidence. P(spam | "free money" in email) = ?
- **Marginal P(evidence):** Normalizing constant — probability of seeing this evidence regardless of hypothesis.

**Worked example:**

P(spam) = 0.20, P(not spam) = 0.80
P("free money" | spam) = 0.80, P("free money" | not spam) = 0.02

P(spam | "free money") = [0.80 × 0.20] / [0.80 × 0.20 + 0.02 × 0.80]
= 0.16 / (0.16 + 0.016) = 0.16 / 0.176 ≈ 0.91

An email with "free money" is 91% likely to be spam.

**Types of ML that use Bayes:**

- **Naive Bayes classifiers** apply this formula directly with the independence assumption.
- **Bayesian neural networks** maintain distributions over weights (not point estimates).
- **Bayesian optimization** (for hyperparameter tuning) updates beliefs about which hyperparameters are best as experiments run.
- **Probabilistic graphical models** represent complex joint distributions as graphs of conditional probabilities.

---

### Q8. What is the difference between a parameter and a statistic?

**Answer:**

This distinction is foundational but often blurred in ML.

**Parameter:** A fixed but unknown number that describes a population. The true mean height of all humans on Earth. The true probability that a coin lands heads. These are properties of the world — they exist but we can't measure the entire population to know them.

**Statistic:** A value computed from a sample. The average height of 1,000 people we measured. The fraction of heads in 500 coin flips. Statistics are our estimates of parameters.

**In ML:**

Model weights are **parameters** — they describe the model, and we estimate them from training data. The process of training = estimating model parameters from a sample (training data). 

The true generalization error of a model is a population parameter (how well it performs on all possible inputs). The test set accuracy is a statistic — our estimate of that parameter from a sample.

**Why this matters:** 

A statistic computed from a sample has uncertainty. Your model's test accuracy is 87% — but if you ran it on a different sample of the same size, it might be 86% or 88%. This uncertainty is called **sampling variability**. Confidence intervals quantify this variability.

A model with 87% accuracy on a test set of 100 examples is much less certain than 87% accuracy on 10,000 examples. The statistic is the same; the uncertainty is different.

---

### Q9. What is the Law of Large Numbers?

**Answer:**

The **Law of Large Numbers (LLN)** states: as a sample size increases, the sample mean converges to the true population mean. The larger your sample, the closer your estimate is to the truth.

**Weak LLN:** For any ε > 0, P(|sample_mean - true_mean| > ε) → 0 as n → ∞. The probability of being far off decreases to zero.

**Strong LLN:** The sample mean almost surely (with probability 1) converges to the true mean.

**What this explains in ML:**

**Why more training data helps:** With more examples, your model's estimates of the data distribution are more accurate. The empirical distribution (what the model sees) converges to the true distribution.

**Why loss on training data converges:** As you process more batches, the running average loss converges to the true expected loss.

**Why large test sets give more reliable estimates:** Accuracy on 10 test examples is unreliable. Accuracy on 100,000 test examples is a solid estimate of true performance.

**The limit of LLN:** LLN guarantees convergence, but doesn't tell you how fast. For practical ML: the convergence rate is roughly O(1/√n) — doubling your sample size halves the estimation error. Going from 100 to 10,000 samples (100x more data) reduces error by 10x, not 100x.

---

### Q10. What is covariance and correlation and how do they affect ML features?

**Answer:**

**Covariance** measures how two variables change together. If X increases when Y increases → positive covariance. If X increases when Y decreases → negative covariance.

Cov(X, Y) = E[(X - E[X])(Y - E[Y])]

Problem: covariance depends on the scale of the variables. Cov(height in cm, weight in kg) ≠ Cov(height in inches, weight in pounds).

**Correlation (Pearson)** standardizes covariance to [-1, 1]:

r = Cov(X, Y) / (σ_X × σ_Y)

r = 1: perfect positive linear relationship. r = -1: perfect negative linear. r = 0: no linear relationship (but may have non-linear relationship!).

**Why this matters for ML:**

**Feature redundancy:** If two features have r ≈ 0.95, they carry almost identical information. Including both doesn't improve your model much but adds noise and computational cost. Principal Component Analysis (PCA) explicitly handles correlated features.

**Multicollinearity in linear regression:** Highly correlated predictors make coefficient estimates unstable. Small changes in data → large swings in coefficients. Regularization (Ridge) helps.

**Feature importance:** Low correlation with the target variable suggests a feature has little predictive power. High correlation suggests it's useful (but doesn't guarantee causation!).

**The covariance matrix:** An n×n matrix where entry (i,j) is Cov(feature_i, feature_j). It's the key object in PCA (eigenvectors = principal components), Gaussian models, and multivariate statistics throughout ML.

---

### Q11. What are the most important probability distributions in ML?

**Answer:**

**Bernoulli distribution:** A single binary trial. P(X=1) = p, P(X=0) = 1-p. Models a single coin flip, a single click/no-click, a single spam/not-spam label. Logistic regression's output models Bernoulli probabilities.

**Binomial distribution:** Number of successes in n independent Bernoulli trials. How many of 100 users will click the ad? Mean = np, Variance = np(1-p).

**Gaussian (Normal) distribution:** Continuous, bell-shaped, symmetric. Models continuous measurements, residuals in regression, and approximations of many processes (CLT). E[X] = μ, Var[X] = σ².

**Poisson distribution:** Number of events in a fixed interval, given a known average rate. Emails per hour, transactions per minute, defects per unit. P(X=k) = (λ^k × e^-λ) / k!. Mean = Variance = λ.

**Exponential distribution:** Time between events in a Poisson process. Time until next transaction, session duration. Models "memoryless" waiting times. Mean = 1/λ.

**Beta distribution:** A distribution over probabilities — values between 0 and 1. Used to model the probability parameter itself (Bayesian priors for click-through rates, conversion rates). Shape controlled by α, β parameters.

**Dirichlet distribution:** Generalization of Beta to K categories. Used as a prior over multinomial distributions. Important in topic models (LDA) where each document's topic mixture follows a Dirichlet.

**Categorical distribution:** Single trial with K possible outcomes. The generalization of Bernoulli to multiple classes. The output of a classification model's softmax layer is parameters of a Categorical distribution.

**Log-normal distribution:** X is log-normal if log(X) is normal. Models quantities that are products of many small factors. Income distribution, network traffic, user session lengths tend to be log-normal.

---

### Q12. What is Maximum Likelihood Estimation (MLE)?

**Answer:**

**MLE** is the most common approach for fitting probability distributions and statistical models to data. The idea: choose the parameters that make the observed data as probable as possible.

**The likelihood function L(θ; data)** is the probability of observing the data as a function of the parameters θ. Note: the data is fixed; the parameters are variable.

L(θ; x₁, x₂, ..., xₙ) = ∏ P(xᵢ | θ)  (assuming independence)

**Log-likelihood:** We maximize log L instead (sum instead of product — numerically stabler):

log L(θ) = Σ log P(xᵢ | θ)

We find θ that maximizes this.

**MLE and common ML loss functions:**

This is the crucial connection most engineers miss. **MLE derives the standard loss functions:**

- **Binary cross-entropy** for logistic regression = negative log-likelihood under Bernoulli distribution.
- **Categorical cross-entropy** for multi-class = negative log-likelihood under Categorical distribution.
- **Mean Squared Error (MSE)** for regression = negative log-likelihood under Gaussian distribution with fixed variance.

When you minimize cross-entropy loss in a neural network, you are performing Maximum Likelihood Estimation. The loss function IS the negative log-likelihood. Training a neural network = finding parameters that maximize likelihood of the training labels.

**Why MLE is powerful:** It has optimal asymptotic properties — as n → ∞, MLE estimates converge to the true parameters faster than any other estimator.

---

## Part 2 — Intermediate Concepts (Q13–Q30)
*Statistical inference, model evaluation, and the math behind training*

---

### Q13. What is the bias-variance trade-off?

**Answer:**

The **bias-variance trade-off** is the fundamental tension in supervised learning between two sources of model error. Every model's generalization error can be decomposed into three components:

**Error = Bias² + Variance + Irreducible Noise**

**Bias:** Error from wrong assumptions in the learning algorithm. A high-bias model is too simple — it underfits. Fitting a straight line to quadratic data has high bias. The model is systematically wrong in the same direction regardless of training data.

**Variance:** Error from sensitivity to small fluctuations in training data. A high-variance model is too complex — it overfits. A degree-15 polynomial fitted to 20 data points has high variance. Show it slightly different training data and it produces a very different model.

**Irreducible noise:** Error from inherent randomness in the target. No model can predict the exact outcome of a coin flip — even the best model can't eliminate this.

**The trade-off:** As model complexity increases, bias decreases (model is flexible enough to capture true patterns) but variance increases (model starts fitting noise). Optimal model complexity balances both.

**In practice:**

| Model Type | Bias | Variance |
|---|---|---|
| Linear regression | High | Low |
| Deep decision tree | Low | High |
| Random forest | Low-Medium | Low-Medium |
| k-NN, k=1 | Low | High |
| k-NN, k=large | High | Low |
| Regularized models | Higher than unregularized | Lower than unregularized |

**Diagnosing bias vs. variance:**

- Training error high, test error high → **high bias** (underfitting). Add features, increase model complexity.
- Training error low, test error much higher → **high variance** (overfitting). Add data, add regularization, reduce complexity.

---

### Q14. What is a hypothesis test and what does a p-value actually mean?

**Answer:**

A **hypothesis test** is a procedure for using data to decide between two competing hypotheses about a population.

**Null hypothesis (H₀):** The default claim, typically "nothing interesting is happening." The new drug has no effect. The two groups have the same mean. The model's change doesn't improve performance.

**Alternative hypothesis (H₁):** The claim you want to demonstrate evidence for. The drug improves outcomes. The groups differ. The new model is better.

**What is a p-value?**

The p-value is the probability of observing data as extreme as (or more extreme than) what you observed, *assuming the null hypothesis is true*.

**What a p-value is NOT:**

- It is NOT the probability that H₀ is true.
- It is NOT the probability that your result is a fluke.
- It is NOT the probability that H₁ is true.

**The decision rule:** If p < α (significance level, usually 0.05), reject H₀. This threshold is arbitrary — a p-value of 0.049 and 0.051 are practically identical, but one "passes" and one "fails."

**For ML engineers:**

A/B test example: You changed your recommendation algorithm. 10,000 users saw the new algorithm, 10,000 saw the old. New: 7.2% click-through rate. Old: 7.0%.

H₀: The two algorithms have the same click-through rate.
H₁: They differ.

p = 0.03 → Reject H₀ at α=0.05. Statistically significant.

But is this practically significant? A 0.2 percentage point improvement with 10,000 users × $0.01 per click = $20 extra revenue. Is that worth the engineering cost?

**Statistical significance ≠ practical significance.** Always report effect sizes alongside p-values.

---

### Q15. What is statistical power and Type I vs Type II errors?

**Answer:**

**Type I error (False Positive):** Rejecting H₀ when it's actually true. Saying the drug works when it doesn't. Saying the new model is better when it's the same.

Probability of Type I error = α (the significance level you chose). By setting α = 0.05, you accept a 5% chance of a false positive.

**Type II error (False Negative):** Failing to reject H₀ when it's actually false. Saying the drug doesn't work when it does. Missing a real improvement.

Probability of Type II error = β.

**Statistical Power = 1 - β:** The probability of correctly detecting a real effect when it exists. Power of 0.80 means if the effect is real, you have an 80% chance of detecting it.

**The relationship:** For fixed sample size, decreasing α (stricter significance) increases β (more false negatives) → lower power. You can't simultaneously minimize both errors without increasing sample size.

**For ML experiments:**

Before running an A/B test, calculate the required sample size for your desired power:

Inputs: desired effect size (how small an improvement is worth detecting), significance level α, power target (typically 0.80 or 0.90).

Output: how many users you need in each group.

If you need to detect a 0.5% improvement in click-through rate with 80% power at α=0.05, you might need 50,000 users per group. If you end your experiment after only 1,000 users per group, you're underpowered — you can't reliably detect real effects, but you'll also frequently miss them.

**Online experimentation problem:** Many ML teams "peek" at results daily and stop when p < 0.05. This inflates Type I errors dramatically — you're doing 30 tests (one per day), not 1.

---

### Q16. What is confidence interval and how is it different from a prediction interval?

**Answer:**

**Confidence interval (CI):** A range of values constructed from sample data that, with specified probability, contains the true population parameter.

"A 95% CI of [6.8%, 7.4%] for click-through rate" does NOT mean: "there's a 95% chance the true CTR is in this range." (The true value is fixed — it's either in the range or not.)

It means: "If we repeated this experiment many times and computed a 95% CI each time, 95% of those intervals would contain the true CTR." This is a property of the procedure, not a probability statement about this specific interval.

**Narrower CI = more precision = larger sample size.**

95% CI for a mean = sample_mean ± 1.96 × (standard_error)
Standard error = standard_deviation / √n

**Prediction interval:** A range for where a single NEW observation will fall. Always wider than the confidence interval.

A confidence interval captures uncertainty about the population mean.
A prediction interval captures uncertainty about where any individual observation will fall.

**Practical example:**

You train a regression model to predict house prices. For a house with certain features, your model predicts $350,000.

- **Confidence interval:** "The true expected price for houses like this is between $340K and $360K." (Uncertainty about the mean.)
- **Prediction interval:** "This specific house will sell between $300K and $400K." (Uncertainty about a single observation, wider because individual houses vary around the mean.)

When you deploy a model and a user asks "what will my house sell for?" — you should report a prediction interval, not a confidence interval.

---

### Q17. What is entropy in information theory and how does it relate to ML?

**Answer:**

**Shannon entropy** measures the average amount of information (surprise) in a probability distribution. A distribution that is very spread out (uncertain) has high entropy. A distribution concentrated at one value has low entropy.

H(X) = -Σ P(x) × log₂ P(x)

Units: **bits** (if log base 2), **nats** (if natural log). ML typically uses nats.

**Intuition:** A fair coin has maximum entropy (1 bit) — each flip is maximally surprising. A coin that always lands heads has zero entropy — there's no uncertainty.

**Cross-entropy:** How much information you need to encode a distribution P using a code designed for distribution Q:

H(P, Q) = -Σ P(x) × log Q(x)

Cross-entropy ≥ H(P), with equality when P = Q.

**Why cross-entropy is the loss function for classification:**

Training a classifier = finding model parameters Q that minimize the cross-entropy between the true label distribution P (one-hot labels) and the predicted distribution Q (softmax output). When Q = P exactly, cross-entropy equals entropy of labels (minimum possible loss).

**KL Divergence:** The "extra cost" of encoding P with Q:

KL(P||Q) = H(P, Q) - H(P) = Σ P(x) × log(P(x)/Q(x))

KL divergence is always ≥ 0, equals 0 iff P = Q. It measures how much Q diverges from P. Minimizing cross-entropy = minimizing KL divergence between predicted and true distributions (H(P) is constant).

**Decision trees** use entropy as a splitting criterion (Information Gain = decrease in entropy after splitting). Maximum information gain = maximum entropy reduction = best feature split.

---

### Q18. What is the central limit theorem and why does it matter for ML evaluation?

**Answer:**

**The Central Limit Theorem (CLT):** When you take n independent samples from any distribution with finite mean μ and variance σ², the distribution of the sample mean approaches a normal distribution as n → ∞:

Sample mean ~ Normal(μ, σ²/n)

This holds regardless of the original distribution's shape.

**Practical rule of thumb:** For n ≥ 30, the normal approximation is usually good. For very skewed distributions, you need more.

**Why this matters for ML evaluation:**

**Accuracy estimation:** Model accuracy on a test set is a sample mean (average of 0/1 indicator variables for correct/incorrect predictions). By CLT, accuracy across different test sets of the same size follows an approximately normal distribution. This is why we can compute confidence intervals for model accuracy.

**A/B testing:** The difference in CTR between two groups is a difference of means → approximately normal by CLT → standard z-test or t-test applies.

**Bootstrapping:** A modern alternative that uses the CLT implicitly. You resample your test set with replacement many times, compute accuracy each time, and use the distribution of results as an estimate of sampling variability. The CLT says this distribution will be approximately normal.

**Batch gradient descent:** Each mini-batch is a random sample of the full training set. The gradient computed from a mini-batch is an estimate of the true gradient. The CLT says this estimate is approximately normally distributed around the true gradient — justifying why stochastic gradient methods work.

---

### Q19. What is regularization from a Bayesian perspective?

**Answer:**

Regularization is usually presented as "a penalty on model complexity to prevent overfitting." The Bayesian interpretation is deeper and more principled: regularization corresponds to a prior distribution over model parameters.

**The connection:**

Bayesian learning maximizes the **posterior** P(θ | data), not just the likelihood P(data | θ):

P(θ | data) ∝ P(data | θ) × P(θ)

Taking the log:
log P(θ | data) = log P(data | θ) + log P(θ) + const

This is equivalent to minimizing: **Negative log-likelihood + Negative log-prior**

**L2 regularization (Ridge) = Gaussian prior:**

If you put a zero-mean Gaussian prior on weights, P(θ) = Normal(0, 1/λ), then:
log P(θ) ∝ -λ × Σ θᵢ²

This gives: loss = NLL + λ × Σ θᵢ² — exactly L2 regularization!

**L1 regularization (Lasso) = Laplace prior:**

A Laplace distribution prior on weights produces:
loss = NLL + λ × Σ |θᵢ| — exactly L1 regularization!

The Laplace distribution has heavier tails than Gaussian but a sharper peak at zero — this is why L1 produces sparse solutions (many exact zeros) while L2 shrinks all weights but rarely to exactly zero.

**Implications:**

- Regularization strength λ = precision of the prior (how strongly you believe weights are small).
- Strong regularization = strong prior belief that weights should be near zero.
- The optimal λ balances prior beliefs against evidence from data.
- Bayesian framing suggests the right way to choose λ is through Bayesian model comparison — or more practically, cross-validation.

---

### Q20. What is overfitting and how do train/validation/test splits prevent it?

**Answer:**

**Overfitting** occurs when a model learns the training data too well — it captures noise and random fluctuations as if they were genuine patterns. The model performs excellently on training data but poorly on new, unseen data.

Root cause: The model has too many parameters relative to the amount of training data, or training goes too long. The model essentially memorizes training examples.

**The split strategy:**

**Training set (typically 60-80%):** Used to estimate model parameters (fit the weights). The model directly optimizes on this data.

**Validation set (typically 10-20%):** Used to tune hyperparameters and make decisions about model architecture. Evaluated frequently during development to catch overfitting. Crucially: the model doesn't train on this — but you (the engineer) make decisions based on it, which introduces a form of indirect overfitting to it.

**Test set (typically 10-20%):** Held out completely until the very end. Used exactly once to estimate true generalization performance. If you evaluate on the test set and then make changes, it's no longer a valid estimate.

**The contamination hierarchy:** Training data → directly improves model. Validation data → indirectly improves model (through your decisions). Test data → must stay isolated.

**Common mistake:** Engineers tune their model, evaluate on test, tweak, evaluate on test again. After 10 rounds of this, the test set is effectively a second validation set and is no longer an unbiased estimate of generalization.

**K-fold cross-validation:** For small datasets, instead of a fixed split, divide data into K folds. Train on K-1 folds, validate on the remaining fold. Repeat K times (each fold is validation once). Average the K validation scores. Gives a more reliable estimate of generalization performance, using all data for training.

---

### Q21. What is a confusion matrix and what metrics derive from it?

**Answer:**

A **confusion matrix** displays the complete picture of classification results across all prediction classes.

For binary classification (Positive = P, Negative = N):

|  | Predicted Positive | Predicted Negative |
|---|---|---|
| **Actual Positive** | True Positive (TP) | False Negative (FN) |
| **Actual Negative** | False Positive (FP) | True Negative (TN) |

**Metrics derived:**

**Accuracy** = (TP + TN) / (TP + TN + FP + FN)
Overall correctness. Misleading when classes are imbalanced.

**Precision** = TP / (TP + FP)
Of all positive predictions, what fraction were correct? "When you say yes, how often are you right?"

**Recall (Sensitivity, True Positive Rate)** = TP / (TP + FN)
Of all actual positives, what fraction did you find? "How many real positives did you catch?"

**Specificity (True Negative Rate)** = TN / (TN + FP)
Of all actual negatives, what fraction did you correctly identify?

**F1 Score** = 2 × (Precision × Recall) / (Precision + Recall)
Harmonic mean of precision and recall. Balanced when both matter equally.

**F-beta Score** = (1+β²) × (Precision × Recall) / (β² × Precision + Recall)
Weighs recall β times more than precision when β > 1 (useful when missing positives is more costly than false alarms).

**For imbalanced datasets:** Accuracy is useless. A dataset with 99% negative examples achieves 99% accuracy by always predicting negative. Use F1, precision, recall, or AUC-ROC.

---

### Q22. What is the ROC curve and AUC?

**Answer:**

**ROC (Receiver Operating Characteristic) curve** plots the True Positive Rate (Recall) against the False Positive Rate at every possible classification threshold.

At threshold = 0: Every example predicted positive → TP rate = 1, FP rate = 1 (top right).
At threshold = 1: Every example predicted negative → TP rate = 0, FP rate = 0 (bottom left).
As threshold decreases from 1 to 0, you trace a curve from bottom-left to top-right.

**A good model** curves toward the top-left corner (high recall, low false positive rate simultaneously).

**AUC (Area Under the ROC Curve):** Ranges from 0.5 (random classifier) to 1.0 (perfect classifier). A classifier that's worse than random has AUC < 0.5.

**Interpretation of AUC:**

AUC = probability that the model will rank a randomly chosen positive example higher than a randomly chosen negative example. AUC = 0.85 means: if you pick a random fraud case and a random legitimate transaction, the model scores the fraud case higher 85% of the time.

This makes AUC threshold-independent — it evaluates the model's ranking ability regardless of where you set the cutoff.

**ROC vs Precision-Recall curves:**

For heavily imbalanced datasets, ROC curves can be misleadingly optimistic. Precision-Recall (PR) curves are more informative when the positive class is rare. A model can have AUC-ROC = 0.95 but AUC-PR = 0.30 on a dataset with 1% positives — the ROC curve doesn't reveal how badly the model fails on the rare class.

Use: ROC for balanced datasets. Precision-Recall for imbalanced (fraud detection, rare disease diagnosis, anomaly detection).

---

### Q23. What is the law of total probability and how does it connect to generative models?

**Answer:**

**Law of total probability:** If events B₁, B₂, ..., Bₙ are mutually exclusive and exhaustive (partition of sample space):

P(A) = Σ P(A|Bᵢ) × P(Bᵢ)

Intuition: To find the probability of A, you consider all the ways A can happen (by going through each possible "scenario" Bᵢ), weight each by how likely that scenario is.

**Example:** P(email is spam) = P(spam|senior executive sender) × P(senior executive) + P(spam|unknown sender) × P(unknown sender) + P(spam|domain in blocklist) × P(blocklist domain) + ...

**Connection to generative models:**

A generative model explicitly models the joint distribution P(X, Y) = P(X|Y) × P(Y):
- P(Y): prior probability of each class.
- P(X|Y): likelihood of features given class.

The law of total probability gives you the marginal P(X) = Σ P(X|Y=y) × P(Y=y).

Naive Bayes is a generative classifier:
P(spam|email) = P(email|spam) × P(spam) / P(email)

where P(email) = P(email|spam) × P(spam) + P(email|ham) × P(ham) — the law of total probability.

This generalizes to Gaussian Mixture Models (GMMs) and Variational Autoencoders (VAEs), where P(x) = ∫ P(x|z) × P(z) dz — integrating over all possible latent variables z (a continuous version of the sum in the law of total probability).

---

### Q24. What is the curse of dimensionality?

**Answer:**

The **curse of dimensionality** refers to phenomena that arise when analyzing data in high-dimensional spaces that don't occur in low dimensions, causing many ML algorithms to fail or become exponentially more expensive.

**The core problems:**

**Volume grows exponentially with dimensions:** To cover 100% of a 1D unit interval with points spaced 0.1 apart, you need 10 points. In 2D (unit square), you need 100 points. In 100D, you need 10¹⁰⁰ points. Collecting representative data in high dimensions is practically impossible.

**All distances become equal:** In high dimensions, the difference between the nearest and farthest neighbor becomes negligible. If you have 1000 features, two examples that are very different on 50 features look "similar" overall because the other 950 features are similar. k-NN becomes meaningless.

**Volume concentrates at the edges:** In high dimensions, most of a hypersphere's volume is in a thin shell near the surface. Most data points are near the "edges" of the space, not the "center." Intuitions from low-dimensional geometry break down.

**Sparsity:** With 1000 binary features, there are 2¹⁰⁰⁰ possible inputs. You'll never see most of them. Your model must generalize from extremely sparse samples.

**Implications for ML:**

- k-NN degrades rapidly above ~20 dimensions. Distances become uninformative.
- Gaussian kernels in SVMs need width tuning that becomes harder in high dimensions.
- Linear models become relatively more competitive in very high dimensions (text data with 50K features) — because non-linear models can't learn non-linear structure they haven't seen.
- Dimensionality reduction (PCA, autoencoders, UMAP) is critical preprocessing before distance-based methods.
- Neural networks work in high dimensions because they learn low-dimensional structure within high-dimensional data — they find the intrinsic manifold the data lives on.

---

### Q25. What is Maximum A Posteriori (MAP) estimation and how does it differ from MLE?

**Answer:**

**MLE** finds parameters θ that maximize the likelihood P(data | θ). It ignores prior beliefs about parameters.

**MAP** finds parameters θ that maximize the posterior P(θ | data) ∝ P(data | θ) × P(θ). It incorporates prior beliefs about what θ should be.

MAP = argmax_θ [log P(data|θ) + log P(θ)]

= MLE objective + regularization term

**The key insight:** MAP with a Gaussian prior on θ = MLE + L2 regularization. MAP with a Laplace prior = MLE + L1 regularization. Every regularized ML model is implicitly doing MAP estimation, not MLE.

**Difference in behavior with limited data:**

- With abundant data: MLE and MAP converge to the same answer (data overwhelms the prior).
- With limited data: MAP is more stable (prior pulls parameters toward reasonable values, preventing extreme estimates).

**Example:**

You're estimating the click-through rate (CTR) of a new ad with 0 clicks out of 0 impressions.
- MLE: 0/0 = undefined (or 0 if you use 0/1 Laplace smoothing, but this is ad hoc).
- MAP with Beta prior: (0 + α) / (0 + α + β), where α, β are prior parameters. If you believe CTR is typically around 5%, set α=1, β=19: MAP estimate = 1/20 = 0.05. Pulls toward 5% in the absence of data.

As you collect data (say 100 clicks out of 1000 impressions), the MAP estimate converges toward the data: (100+1)/(1000+20) ≈ 9.9%, close to the MLE of 10%.

This is the mathematical foundation of Bayesian updating and why Bayesian methods are better calibrated with limited data.

---

### Q26. What is sampling and what are Monte Carlo methods?

**Answer:**

**Sampling** is generating random values from a probability distribution. If you know the distribution, you can simulate data from it. This sounds trivial but is incredibly powerful.

**Monte Carlo methods** use repeated random sampling to compute numerical answers to deterministic problems that are hard to solve analytically.

**Basic Monte Carlo integration:**

Estimate π: Inscribe a circle in a square. Randomly sample (x,y) points in the square. Fraction inside circle = π/4. With 1 million samples, estimate π to 4 decimal places.

**Why this generalizes to ML:**

Many ML quantities are intractable integrals. The expected loss over the entire data distribution, the posterior expected value in Bayesian models — we can't compute these exactly, but we can estimate them via sampling.

**Monte Carlo in ML applications:**

**Dropout at inference time (MC Dropout):** Run inference with dropout enabled N times. The variance of predictions estimates model uncertainty. This is Monte Carlo sampling from the approximate posterior over model weights.

**Monte Carlo Tree Search (MCTS):** Used in AlphaGo/AlphaZero. Simulate many random game playouts from each board position to estimate win probability. Guided search through the game tree.

**Sampling for reinforcement learning:** Collecting experience by running the agent in the environment is Monte Carlo sampling of the policy's trajectories. Policy gradient methods estimate the gradient of expected reward via samples.

**Importance sampling:** When you can't directly sample from the target distribution P, sample from a simpler distribution Q and reweight: E_P[f(x)] ≈ (1/n) × Σ f(xᵢ) × P(xᵢ)/Q(xᵢ). Used in off-policy RL, variance reduction.

---

### Q27. What is a statistical test for comparing two ML models?

**Answer:**

Comparing two models' performance on the same test set requires careful statistical treatment — you're not comparing two independent experiments, you're comparing paired observations.

**The paired t-test:** The standard choice when comparing two models on the same test set.

For n test examples, compute dᵢ = accuracy_A_on_example_i - accuracy_B_on_example_i (1 if A correct and B wrong, -1 if B correct and A wrong, 0 if both same).

t = (d̄) / (s_d / √n) where d̄ is mean of differences, s_d is their standard deviation.

Under H₀ (models are equivalent), t follows a t-distribution with n-1 degrees of freedom.

**McNemar's test:** More appropriate when comparing binary outcomes (correct/incorrect). Uses only the examples where the models disagree. Tests whether disagreements are symmetric (if asymmetric, one model is systematically better).

**Bootstrap test:** Compute the difference in accuracy. Resample the test set 10,000 times. Compute the difference in accuracy each time. The p-value is the fraction of resamples where model B beats model A (under H₀ of equal performance).

**5×2 cross-validation test (Dietterich 1998):** Run 5 complete 2-fold cross-validation experiments. Uses the variance across folds to compute the test statistic. Better calibrated than simple test set comparison.

**Common mistake:** Running many model comparisons without correction inflates Type I error. If you compare 20 models and find one significantly better (p=0.04), that might be chance. Apply Bonferroni correction: require p < 0.05/20 = 0.0025 for significance.

---

### Q28. What is multicollinearity and when does it hurt ML models?

**Answer:**

**Multicollinearity** occurs when two or more features are highly correlated with each other — not necessarily with the target, but with each other.

**Why it hurts linear models:**

In linear regression y = β₀ + β₁x₁ + β₂x₂, if x₁ ≈ x₂ (highly correlated), the model can't distinguish their individual contributions. If x₂ = x₁ + noise, then β₁ = 5, β₂ = 0 and β₁ = 0, β₂ = 5 and β₁ = 2.5, β₂ = 2.5 all produce almost the same predictions. The coefficients become unstable — tiny changes in training data flip them wildly.

Mathematically: The design matrix X^T X becomes nearly singular (near-zero determinant). Its inverse — needed to compute OLS coefficients — is numerically unstable.

**Symptoms:**

- Coefficient estimates have huge standard errors.
- Adding/removing a feature drastically changes other coefficients.
- Correlation between features > 0.9.
- Variance Inflation Factor (VIF) > 10 for a feature.

**Affected models:**

- Linear and logistic regression: severely affected (coefficients unstable).
- Neural networks: mildly affected (non-linear, learn to handle correlation implicitly).
- Tree-based models (XGBoost, Random Forest): largely unaffected (they split on one feature at a time).
- PCA: explicitly removes multicollinearity by orthogonalizing features.

**Solutions:**

Remove one of the correlated features (keep the more interpretable or more predictive one). Apply PCA before modeling. Use Ridge regression (L2 regularization stabilizes coefficients when X^T X is ill-conditioned).

---

### Q29. What is the chi-square test and when is it used in ML?

**Answer:**

The **chi-square (χ²) test** tests the association between categorical variables. It answers: "Is the distribution of outcomes the same across different groups?" or "Are these two categorical variables independent?"

**Test statistic:**

χ² = Σ (Observed - Expected)² / Expected

where Expected = (row total × column total) / grand total under the independence assumption.

Higher χ² = stronger evidence against independence.

**Where it appears in ML:**

**Feature selection for classification:** Chi-square test between each categorical feature and the target variable. Features with high χ² statistic are strongly associated with the label → useful features. This is the basis of chi2 feature selection in scikit-learn.

**Goodness-of-fit test:** Does your model's predicted class distribution match the actual distribution? Comparing observed class frequencies to expected (predicted) frequencies.

**Independence testing in feature engineering:** Are two categorical features related? If "country" and "language" have χ² test p < 0.001, they're strongly associated → you might not need both in your model.

**Checking for data bias:** Does the demographic distribution in your training data match the production distribution? Chi-square test detects systematic differences.

**Limitations:** Requires adequate sample size (expected count ≥ 5 in each cell). Only detects association, not causation. Only works for categorical variables — use correlation or mutual information for continuous variables.

---

### Q30. What is mutual information and how is it used in feature selection?

**Answer:**

**Mutual information (MI)** measures the amount of information that one variable X contains about another variable Y. Equivalently, it measures how much knowing X reduces uncertainty about Y.

MI(X; Y) = H(Y) - H(Y|X)

= KL(P(X,Y) || P(X)P(Y))

MI = 0 when X and Y are independent (knowing X tells you nothing about Y).
MI > 0 when they're dependent.

**Why MI is better than correlation for feature selection:**

Correlation only measures linear relationships. MI captures any relationship — linear, polynomial, periodic, any non-linear dependency. Two variables can have correlation = 0 but MI > 0 (e.g., Y = X², where X has zero mean).

**Applications in ML:**

**Filter-based feature selection:** Rank all features by their MI with the target variable. Keep top-K features. This is fast (computed before training) and model-agnostic.

**Information bottleneck theory:** A framework for understanding deep learning. Neural networks compress input X to a representation Z that retains as much information about target Y as possible while discarding irrelevant information about X. MI(Z; Y) should be high; MI(Z; X) should be minimized.

**Neural network interpretability:** Compute MI between each layer's activations and the input/output. Tracks how much information about input is retained through layers.

**Practical computation:** MI with continuous variables requires density estimation, which is hard. In practice, use binned approximations, k-NN estimators (Kraskov estimator), or kernel-based methods. For discrete variables, the computation is straightforward from empirical frequencies.

---

## Part 3 — Advanced Concepts (Q31–50)
*Bayesian methods, probabilistic models, information geometry, and deep statistical reasoning*

---

### Q31. What is a Gaussian Mixture Model (GMM) and how does EM algorithm fit it?

**Answer:**

A **Gaussian Mixture Model** models a dataset as a mixture of K Gaussian distributions. Each data point is assumed to have been generated by first sampling a component (cluster) from a Categorical distribution, then sampling from the Gaussian of that component.

P(x) = Σₖ πₖ × N(x; μₖ, Σₖ)

where πₖ are mixture weights (sum to 1), μₖ are means, Σₖ are covariance matrices.

**The problem:** The component assignments (which Gaussian generated each point) are unobserved (latent). We can't use direct MLE because we don't know who belongs to which cluster.

**Expectation-Maximization (EM) algorithm:**

**E-step (Expectation):** For current parameters, compute the posterior probability that each data point belongs to each component — the "responsibility" of component k for point xᵢ:

rᵢₖ = πₖ × N(xᵢ; μₖ, Σₖ) / Σⱼ πⱼ × N(xᵢ; μⱼ, Σⱼ)

**M-step (Maximization):** Update parameters to maximize the expected complete-data log-likelihood using the computed responsibilities:

πₖ = (1/n) × Σᵢ rᵢₖ
μₖ = Σᵢ rᵢₖxᵢ / Σᵢ rᵢₖ
Σₖ = Σᵢ rᵢₖ(xᵢ-μₖ)(xᵢ-μₖ)ᵀ / Σᵢ rᵢₖ

**Repeat until convergence.** EM provably increases likelihood at each step (never decreases it) but may converge to local optima.

**Why EM matters beyond GMMs:** EM is a general algorithm for any model with latent (unobserved) variables — Hidden Markov Models (Baum-Welch algorithm = EM), LDA topic models (variational EM), and training autoencoders with discrete latent variables.

---

### Q32. What is a hypothesis test for model comparison and what is the null hypothesis significance testing controversy?

**Answer:**

*This continues from Q27 by examining the deeper philosophical issues.*

The standard practice of reporting p < 0.05 as "statistically significant" is widely criticized as deeply flawed. Understanding why is essential for rigorous ML evaluation.

**Problems with NHST (Null Hypothesis Significance Testing):**

**The p-value answers the wrong question.** Researchers want P(hypothesis is true | data). P-value gives P(data this extreme | hypothesis is false). These are fundamentally different quantities (Bayes' theorem!). Confusing them is called the "inverse probability fallacy."

**Statistical significance ≠ practical significance.** With 1,000,000 users, even a meaningless 0.001% improvement in click-through rate has p < 0.001. Sample size allows you to detect arbitrarily tiny effects. Significance says nothing about importance.

**The multiple comparisons problem.** Run 20 A/B tests with truly null effects at α=0.05 → expect 1 false positive on average. If you test 100 model variants, about 5 will "significantly" outperform the baseline by chance.

**Publication bias (in research, and in internal ML reporting).** Positive results (new model works) are reported; negative (new model doesn't help) are not. The literature (and internal dashboards) are biased toward false positives.

**Better alternatives:**

**Effect sizes with confidence intervals:** Report the magnitude and uncertainty, not just p-value. "New model increases CTR by 0.3% (95% CI: 0.1% to 0.5%)."

**Bayesian hypothesis testing:** Compute the Bayes factor — the ratio of evidence for H₁ to H₀. Directly answers "which hypothesis does the data support?"

**Practical significance thresholds:** Pre-specify the minimum effect size worth deploying. Reject the new model if the CI doesn't exclude the minimum practically meaningful effect.

---

### Q33. What is a Bayesian linear regression and how does it produce uncertainty estimates?

**Answer:**

**Standard (frequentist) linear regression** finds a single point estimate of weights W: the vector that minimizes MSE. It reports W but not uncertainty about W.

**Bayesian linear regression** maintains a probability distribution over weights W:

Prior: P(W) = Normal(0, α⁻¹I) — weights are small (similar to Ridge regularization)
Likelihood: P(y|X, W) = Normal(XW, β⁻¹I) — outputs are noisy
Posterior: P(W|X, y) ∝ P(y|X, W) × P(W)

For Gaussian linear regression, the posterior is also Gaussian (conjugate prior):

P(W|X, y) = Normal(W_N, S_N)

where W_N and S_N are the posterior mean and covariance (computed analytically).

**Predictive distribution for a new input x*:**

P(y*|x*, X, y) = ∫ P(y*|x*, W) × P(W|X, y) dW = Normal(W_Nᵀ x*, σ*²)

where σ*² captures both measurement noise AND uncertainty about W.

**Key property:** Uncertainty is larger far from training data. Near many training points, the posterior on W is tight → small predictive uncertainty. At inputs far from training distribution → posterior on W is diffuse → large predictive uncertainty.

**Why this matters for ML:**

This is the mathematical foundation of Gaussian Processes (GP), which generalize Bayesian linear regression to non-parametric models. It also motivates approximate Bayesian methods for neural networks (Laplace approximation, variational inference, MC Dropout) that estimate uncertainty without full posterior computation.

---

### Q34. What are Markov chains and why do they matter for ML?

**Answer:**

A **Markov chain** is a sequence of random variables X₁, X₂, X₃, ... where the future depends only on the present, not on the past:

P(Xₜ₊₁ | Xₜ, Xₜ₋₁, ..., X₁) = P(Xₜ₊₁ | Xₜ)

This is the **Markov property** — memorylessness.

**Key concepts:**

**Transition matrix P:** P[i,j] = P(Xₜ₊₁ = j | Xₜ = i). Row i gives the probability of transitioning to each state from state i.

**Stationary distribution π:** A distribution such that πP = π. If you start in π, you stay in π. Represents the long-run fraction of time spent in each state.

**Ergodic chain:** Has a unique stationary distribution that the chain converges to from any starting state.

**Where Markov chains appear in ML:**

**Hidden Markov Models (HMM):** Sequence model for speech recognition, NLP. Observed outputs (words, phonemes) are generated by hidden states (word identity, phoneme) that evolve as a Markov chain. The Viterbi algorithm finds the most likely hidden state sequence.

**Markov Chain Monte Carlo (MCMC):** The most important use. To sample from a complex distribution P(θ|data) (posterior in Bayesian models), construct a Markov chain whose stationary distribution IS P(θ|data). Run the chain long enough → samples approximate the posterior. Metropolis-Hastings and Gibbs sampling are MCMC algorithms.

**Reinforcement learning:** The environment is modeled as a Markov Decision Process (MDP) — the current state is sufficient to determine transition probabilities (Markov property). This assumption is foundational to all tabular RL and justifies using just the current state as input.

**PageRank:** Google's original ranking algorithm treats web surfers as a Markov chain on the web graph. PageRank = stationary distribution of this chain.

---

### Q35. What is variational inference and why is it an approximation to Bayesian posterior?

**Answer:**

The exact Bayesian posterior P(θ|data) is often intractable — the normalization constant requires integrating over all possible parameter values, which is exponentially expensive or analytically impossible.

**Variational Inference (VI)** approximates the true posterior P(θ|data) with a simpler distribution Q(θ) from a tractable family (e.g., Gaussian), chosen to minimize KL(Q||P).

The optimization problem: find Q* = argmin_Q KL(Q(θ) || P(θ|data))

**The Evidence Lower Bound (ELBO):**

Since P(θ|data) is intractable, we rewrite the KL divergence:

log P(data) = ELBO + KL(Q||P)

Since log P(data) is constant and KL ≥ 0:
**Maximizing the ELBO = minimizing KL(Q||P)**

ELBO = E_Q[log P(data, θ)] - E_Q[log Q(θ)]
= E_Q[log P(data|θ)] - KL(Q(θ)||P(θ))

= Expected log-likelihood - KL from prior

**The mean-field approximation:** Assume Q factorizes across parameter groups: Q(θ) = ∏ Qᵢ(θᵢ). Each factor can be optimized while holding others fixed (coordinate ascent in ELBO).

**Connection to VAE:**

The Variational Autoencoder (VAE) is variational inference implemented as a neural network. The encoder q_φ(z|x) approximates the posterior P(z|x). The decoder p_θ(x|z) is the likelihood. Training maximizes the ELBO per data point:

ELBO = E_{q_φ(z|x)}[log p_θ(x|z)] - KL(q_φ(z|x) || p(z))

= Reconstruction term - Regularization term

This is why the VAE loss = reconstruction error + KL divergence.

---

### Q36. What is the kernel trick and why does it extend linear methods to non-linear problems?

**Answer:**

The **kernel trick** is a mathematical technique that allows linear algorithms to implicitly operate in a high-dimensional (even infinite-dimensional) feature space without explicitly computing the coordinates in that space.

**The key observation:** Many linear algorithms (SVM, linear regression, PCA, k-means) only need pairwise inner products between data points, not the individual coordinates.

If you define a feature mapping φ: ℝⁿ → ℝᵐ (low → high dimensions), you need to compute φ(xᵢ)ᵀφ(xⱼ) for each pair. If m is huge (millions), this is expensive.

**A kernel function K(xᵢ, xⱼ) = φ(xᵢ)ᵀφ(xⱼ)** computes this inner product DIRECTLY from the original inputs, without ever computing φ(x).

**Common kernels:**

Linear: K(x, x') = xᵀx' (no transformation)
Polynomial: K(x, x') = (xᵀx' + c)^d (implicit polynomial features of degree d)
RBF (Gaussian): K(x, x') = exp(-γ||x - x'||²) (implicit infinite-dimensional feature space)
String kernel: K(s, s') = count of common substrings (for text, without explicit features)

**Why RBF kernel is remarkable:**

The RBF kernel corresponds to an INFINITE-dimensional feature space. You're implicitly working with infinitely many features (all possible polynomial features of all degrees), but the computation is just K(x,x') = exp(-γ||x-x'||²) — a single scalar computation.

**Mercer's theorem:** Any positive semi-definite symmetric function K(x,x') is a valid kernel, guaranteed to correspond to some inner product in some feature space.

**Limitations:** Kernels scale as O(n²) in data points (you need all pairwise similarities). For large n (millions of examples), kernel SVMs are impractical. This is why deep learning, which implicitly learns representations, has largely supplanted kernel methods at scale.

---

### Q37. What is the Fisher information matrix and why does it appear in optimization?

**Answer:**

The **Fisher information matrix** I(θ) measures how much information a random variable X carries about the parameters θ of its distribution.

I(θ) = E[(∂log P(X;θ)/∂θ)(∂log P(X;θ)/∂θ)ᵀ]
= -E[∂²log P(X;θ)/∂θ∂θᵀ]

The score function ∂log P(x;θ)/∂θ measures how sensitive the log-likelihood is to parameters at a specific observation. Fisher information is the variance of the score.

**High Fisher information:** The distribution changes a lot when parameters change → you can estimate parameters precisely from data.
**Low Fisher information:** The distribution is insensitive to parameters → hard to estimate parameters.

**Cramér-Rao lower bound:** The variance of any unbiased estimator θ̂ is bounded below by the inverse of Fisher information:

Var(θ̂) ≥ I(θ)⁻¹

The MLE achieves this bound asymptotically — it's the most efficient unbiased estimator.

**Fisher information in optimization:**

**Natural gradient descent** uses the Fisher information matrix as a Riemannian metric on the parameter space. Standard gradient descent takes steps in Euclidean parameter space, which treats all parameter changes equally. Natural gradient accounts for the geometry of the distribution — taking steps that are equal in terms of KL divergence, not Euclidean distance.

Update: θ ← θ + η × I(θ)⁻¹ × ∇L(θ)

This converges faster than standard gradient descent for many models and is the theoretical foundation of second-order optimization methods and K-FAC (Kronecker-Factored Approximate Curvature) used in training large neural networks.

---

### Q38. What are conjugate priors and why do they simplify Bayesian inference?

**Answer:**

In Bayesian inference, computing the posterior P(θ|data) requires multiplying the prior P(θ) by the likelihood P(data|θ) and normalizing. Often the result is a complex, intractable distribution.

A **conjugate prior** is a prior that, when combined with a specific likelihood, produces a posterior of the same family as the prior. This makes the posterior analytically computable.

**Key conjugate pairs:**

| Likelihood | Conjugate Prior | Posterior |
|---|---|---|
| Bernoulli/Binomial | Beta | Beta |
| Poisson | Gamma | Gamma |
| Gaussian (known variance) | Gaussian | Gaussian |
| Gaussian (unknown variance) | Normal-Inverse-Gamma | Normal-Inverse-Gamma |
| Multinomial | Dirichlet | Dirichlet |

**Beta-Binomial example:**

Prior: P(p) = Beta(α, β) (belief about click rate)
Likelihood: P(k clicks | n trials, p) = Binomial(n, p)
Posterior: P(p | k, n) = Beta(α + k, β + n - k)

If α=1, β=1 (uniform prior) and you observe 7 clicks in 10 trials:
Posterior = Beta(8, 4) → mean = 8/(8+4) = 0.667

**Why conjugate priors matter for ML:**

They enable closed-form Bayesian updates — no MCMC needed. This makes Bayesian methods practical for:

- **Bandits:** Beta-Bernoulli model for click rates enables Thompson Sampling with O(1) updates.
- **Naive Bayes:** Dirichlet-Multinomial conjugacy enables efficient parameter estimation with Laplace smoothing (adding pseudocounts = adding to Dirichlet α parameters).
- **Topic models:** LDA uses Dirichlet priors precisely because Dirichlet-Multinomial is conjugate.
- **Online learning:** Conjugate updates are O(1) per observation — perfect for streaming.

---

### Q39. What is the VC dimension and PAC learning theory?

**Answer:**

**VC dimension** (Vapnik-Chervonenkis dimension) is a measure of a model's capacity — its ability to fit arbitrary labels. High VC dimension = high capacity = can fit more patterns, but also more prone to overfitting.

**Shattering:** A model class H shatters a set of points S if, for every possible labeling of S (2^|S| labelings), some model in H correctly classifies all points.

**VC dimension** = the size of the largest set that can be shattered.

**Examples:**

- Linear classifiers in ℝ²: VC dimension = 3 (can shatter any 3 points, but not all 4-point arrangements).
- Linear classifiers in ℝⁿ: VC dimension = n + 1.
- Infinite-capacity models (e.g., 1-NN): VC dimension = ∞.

**PAC (Probably Approximately Correct) learning:**

PAC learning theory asks: how many samples do you need to learn a "good" classifier?

To learn a classifier with error ≤ ε with probability ≥ 1-δ:

n ≥ O((d × log(1/ε) + log(1/δ)) / ε)

where d is the VC dimension.

**Fundamental theorem of learning:** A model class is PAC-learnable if and only if it has finite VC dimension.

**Generalization bound:**

With n training examples and a model with VC dimension d, with probability ≥ 1-δ:

test error ≤ train error + O(√(d/n × log(n/d) + log(1/δ)/n))

This bound shows: models with lower VC dimension generalize better. With fixed d, more data tightens the bound. Modern neural networks have enormous VC dimension but still generalize — reconciling this with theory is an active research area (implicit regularization, flat minima, etc.).

---

### Q40. What is the bootstrap and what are its limitations?

**Answer:**

**The bootstrap** is a resampling method for estimating the sampling distribution of a statistic without analytical formulas.

**Procedure:**

1. From your n original samples, draw n samples WITH REPLACEMENT (a "bootstrap sample").
2. Compute the statistic of interest (mean, median, AUC, correlation, ...) on this bootstrap sample.
3. Repeat steps 1-2 B times (typically B = 1000-10000).
4. The distribution of the B bootstrap statistics approximates the sampling distribution of the statistic.

**Applications:**

**Confidence intervals:** The 2.5th and 97.5th percentiles of bootstrap statistics form a 95% bootstrap CI. Works for any statistic, even ones with no analytical CI formula.

**Model evaluation:** Bootstrap estimates of model accuracy, including its variance. If AUC has high bootstrap variance, your estimate is unreliable (need more data).

**Ensemble learning (bagging):** Train each tree in a random forest on a bootstrap sample. The ensemble averages over bootstrap estimates → reduces variance (lower overfitting). "Bootstrap AGGregating" = BAGging.

**Why the bootstrap works:** The empirical distribution (your n samples) is the best estimate of the true distribution. Sampling from the empirical distribution simulates new "experiments" from the true distribution.

**Limitations:**

The bootstrap relies on the original sample being representative of the population. If your training set is severely biased (all data from one city, one demographic), bootstrap samples are all equally biased.

Bootstrap CIs can be inaccurate in the tails (extreme quantiles) and for non-smooth statistics (argmax, quantiles of discrete distributions).

For time-series data, the i.i.d. assumption is violated. Use the block bootstrap instead (resample consecutive blocks to preserve temporal structure).

---

### Q41. What is causal inference and why does it matter more than correlation in ML?

**Answer:**

**Correlation** is a statistical relationship: when A changes, B tends to change. No directionality implied.

**Causation** is a mechanistic claim: changing A directly causes a change in B, all else equal.

**The fundamental problem:** Correlation-based ML models can't distinguish causation from confounding. Models learn whatever patterns exist in the data — including spurious ones caused by confounders.

**Confounders** are variables that influence both the "treatment" and "outcome." Ice cream sales and drowning rates are correlated (both increase in summer) but neither causes the other — summer is the confounder.

**Why this destroys ML model reliability in deployment:**

Your model predicts hospital readmission. It finds that "having been prescribed a painkiller" is positively associated with readmission. Conclusion: painkillers cause readmission?

No. Sicker patients are prescribed more painkillers AND more likely to be readmitted. Illness severity is the confounder. The model learned a spurious correlation. If you use this model to reduce readmission by withholding painkillers, you'd harm patients.

**Potential outcomes framework (Rubin Causal Model):**

For each individual, define Y(1) = outcome if treated, Y(0) = outcome if not treated.

Average Treatment Effect (ATE) = E[Y(1) - Y(0)]

The **fundamental problem of causal inference:** You can never observe both Y(1) and Y(0) for the same individual (you either treated them or you didn't). One is always counterfactual.

**Methods for causal inference:**

**Randomized Controlled Trials (RCT):** Randomly assign treatment → eliminates confounding. The gold standard.

**Observational methods (when RCT is impossible):**
- Propensity score matching: match treated and untreated individuals with similar probability of treatment.
- Instrumental variables: use a variable that affects treatment but not outcome directly.
- Difference-in-differences: compare change in outcome before/after treatment between treated and control groups.

**For ML:** Causal ML methods (CausalML, DoWhy) estimate heterogeneous treatment effects from observational data. In recommendation systems, causal thinking prevents filter bubbles and spurious personalization.

---

### Q42. What is dimensionality reduction from a statistical perspective?

**Answer:**

Dimensionality reduction finds a low-dimensional representation of high-dimensional data that preserves important statistical structure. Different methods preserve different notions of "important."

**PCA (Principal Component Analysis):**

Finds orthogonal directions of maximum variance in the data. The first principal component (PC1) is the direction with the highest variance. PC2 is orthogonal to PC1 with the second-highest variance. And so on.

Mathematically: eigendecomposition of the covariance matrix. Eigenvectors = principal components. Eigenvalues = variance explained by each component.

**Statistical interpretation:** PCA is the optimal linear dimensionality reduction under MSE. The first K PCs retain more variance than any other K-dimensional linear projection.

**Limitations:** PCA is linear — can only find linear combinations of features. Real-world data often has non-linear structure.

**Factor Analysis:**

Models the covariance structure as: X = LF + ε, where F is a low-dimensional latent factor, L is a loading matrix, ε is noise. Unlike PCA (which is a rotation of the data), factor analysis is a generative model of the covariance structure.

**Independent Component Analysis (ICA):**

Finds independent (not just uncorrelated) components. PCA decorrelates; ICA finds statistically independent directions. Useful for signal separation (cocktail party problem), EEG source separation, and understanding disentangled representations in neural networks.

**Statistical interpretation of t-SNE and UMAP:**

t-SNE minimizes KL divergence between pairwise distance distributions in high and low dimensions. UMAP minimizes cross-entropy between fuzzy topological representations. Both are probabilistic: they model neighborhood relationships as probability distributions and find 2D layouts that match these distributions.

---

### Q43. What is the expectation-maximization algorithm in general terms?

**Answer:**

*Building on Q31's GMM example with the general formulation.*

EM is a general algorithm for finding MLE (or MAP) estimates when the model has **latent (hidden) variables** Z alongside observed data X.

**The problem:** Maximize log P(X; θ) over parameters θ. But P(X; θ) = ∫ P(X, Z; θ) dZ involves an integral over all latent configurations — often intractable.

**EM's key insight:** Instead of directly maximizing log P(X; θ), maximize a lower bound that IS tractable:

**Q-function:** Q(θ; θ_old) = E_{Z|X, θ_old}[log P(X, Z; θ)]

= Expected complete-data log-likelihood under the current parameter estimate.

**Algorithm:**

**E-step:** Compute Q(θ; θ_old) = E_{P(Z|X, θ_old)}[log P(X, Z; θ)]

This requires computing P(Z|X, θ_old) — the posterior over latent variables given current parameters. For GMMs, this is the cluster responsibilities. For HMMs, this is the forward-backward algorithm.

**M-step:** θ_new = argmax_θ Q(θ; θ_old)

Maximize the Q-function — easier than maximizing log P(X; θ) because the integral is gone (we took expectation instead).

**Convergence:** At each iteration, log P(X; θ) is non-decreasing (EM never makes things worse). It converges to a local maximum (not necessarily global).

**Generalized EM (GEM):** The M-step only needs to INCREASE Q, not maximize it. This gives more flexibility — gradient ascent steps on Q qualify as GEM.

**Connection to variational inference:** EM is a special case of variational inference where the E-step computes the exact posterior (when tractable). When exact posterior is intractable, variational EM approximates it.

---

### Q44. What is the concept of sufficient statistics?

**Answer:**

A **sufficient statistic** T(X) is a function of the data that captures all information in the data relevant to estimating parameter θ. Once you know T(X), you can throw away the raw data — it contains nothing more about θ.

**Formal definition:** T(X) is sufficient for θ if the conditional distribution P(X | T(X)) does not depend on θ.

**Fisher-Neyman factorization theorem:** T(X) is sufficient for θ if and only if the joint density factors as:

f(x; θ) = g(T(x), θ) × h(x)

where g depends on x only through T(x).

**Examples:**

- Estimating mean of Gaussian with known variance: T(X) = sample mean x̄ is sufficient. You don't need individual observations, just their sum.
- Estimating p in Binomial: T(X) = number of successes k is sufficient. You don't need to know which trials succeeded.
- Estimating θ in Exponential: T(X) = sample mean is sufficient.

**Minimal sufficient statistic:** The coarsest sufficient statistic — it summarizes the data as much as possible while losing no information about θ.

**Why this matters for ML:**

The sufficient statistics of a distribution are exactly the statistics the MLE uses. For exponential family distributions (Gaussian, Bernoulli, Poisson, Exponential), the sufficient statistics are exactly the quantities the model's parameters interact with.

In neural networks, the learned representations can be thought of as learned sufficient statistics for the prediction task. The representation Z should be sufficient for Y (the label) while discarding information irrelevant to Y. This is the information bottleneck principle.

---

### Q45. What are graphical models and how do they represent joint distributions?

**Answer:**

**Probabilistic graphical models (PGMs)** represent high-dimensional joint distributions compactly using graph structure. The graph encodes conditional independence assumptions — which variables directly influence each other.

**Bayesian networks (directed graphical models):**

A directed acyclic graph (DAG) where nodes are variables and edges represent direct causal/conditional dependencies.

Joint distribution factorizes as:
P(X₁, X₂, ..., Xₙ) = ∏ᵢ P(Xᵢ | Parents(Xᵢ))

**Markov networks (undirected graphical models):**

Undirected graph where edges represent symmetric correlations. Joint distribution:
P(X) = (1/Z) × ∏_C ψ_C(X_C)

where C are cliques (fully connected subgraphs) and ψ_C are potential functions. Z is the partition function (normalizing constant) — often intractable.

**d-separation (for Bayesian networks):**

Given a graph, d-separation lets you read off conditional independencies without computing anything. If X and Y are d-separated given Z, then X ⊥ Y | Z.

**Key structures:**

- Chain: X → Z → Y. X and Y are independent given Z (Markov property).
- Fork: X ← Z → Y. X and Y are independent given Z (common cause).
- Collider: X → Z ← Y. X and Y are INDEPENDENT unconditionally but DEPENDENT given Z (explaining away).

**Applications in ML:**

- **Naive Bayes:** A Bayesian network with class label Y as parent of all features. The "naive" assumption is that features are conditionally independent given Y — all arcs go from Y to features, none between features.
- **Hidden Markov Models:** A chain of hidden states, each generating an observation.
- **Variational Autoencoders:** Latent variables z generate observations x. The encoder approximates P(z|x); the decoder represents P(x|z).
- **Causal models:** Directed graphs where edges represent causal relationships, enabling intervention analysis.

---

### Q46. What is the distinction between parametric and non-parametric statistics?

**Answer:**

**Parametric methods** assume the data follows a specific distribution (usually Gaussian) and estimate the parameters of that distribution. Conclusions about the population are drawn through those parameters.

Examples: t-test (assumes Gaussian), linear regression (assumes Gaussian errors), ANOVA, Pearson correlation.

**Non-parametric methods** make minimal distributional assumptions. They work directly with the data's rank or ordering rather than assuming a distribution.

Examples: Mann-Whitney U test, Spearman correlation, Wilcoxon signed-rank test, kernel density estimation, bootstrap.

**When to use each:**

Use parametric when: data is approximately Gaussian, large samples (CLT helps), specific parametric model is appropriate.

Use non-parametric when: data is heavily skewed, ordinal data (rankings, Likert scale), small samples where CLT doesn't apply, outliers are present, you don't know the distribution.

**Tradeoffs:**

Parametric tests have more statistical power when assumptions hold (they use more information). Non-parametric tests have lower power but are valid for more situations.

**Non-parametric ML methods:**

k-Nearest Neighbors, kernel density estimation, decision trees (in their non-regularized form), and kernel methods are non-parametric — they don't assume a fixed functional form for the model. The complexity grows with data rather than being fixed upfront.

Gaussian Processes are the non-parametric Bayesian regression model — instead of specifying a fixed parameterized function, the prior is directly over functions, making no commitment to a specific functional form.

**Why this matters in practice:** Running a t-test when your data is heavily skewed gives misleading results. Recognizing when assumptions are violated and choosing appropriate non-parametric alternatives is a sign of statistical maturity.

---

### Q47. What is model selection and information criteria (AIC, BIC)?

**Answer:**

**Model selection** asks: among several candidate models, which best balances fit and complexity?

Purely maximizing likelihood always favors more complex models — a polynomial of degree n will perfectly fit n data points. This is the overfitting problem in a statistical framework.

**Information criteria penalize complexity to prevent overfitting:**

**AIC (Akaike Information Criterion):**
AIC = -2 × log L + 2k

where log L is the maximized log-likelihood and k is the number of parameters.

Lower AIC = better model. The penalty 2k grows linearly with parameters.

AIC estimates the expected out-of-sample prediction error (relative KL divergence between model and true distribution). It's asymptotically optimal for prediction.

**BIC (Bayesian Information Criterion):**
BIC = -2 × log L + k × log(n)

The penalty is k × log(n), which grows with both parameters AND sample size.

BIC approximates -2 × log P(data|model) + const, where P(data|model) is the marginal likelihood after integrating out parameters. It's designed for model identification (finding the true model), not prediction.

**AIC vs. BIC:**

BIC penalizes complexity more strongly (for n ≥ 8, log(n) > 2, so BIC > AIC penalty). BIC is consistent — it selects the true model as n → ∞ (if the true model is in the candidate set). AIC is not consistent but produces better predictive performance in finite samples.

Use AIC for prediction. Use BIC for identifying the "true" model structure.

**In ML context:**

Information criteria are used in neural architecture search (penalize network size), in determining optimal number of clusters (BIC for GMMs), and in feature selection (penalize model complexity when adding features).

---

### Q48. What is the relationship between cross-entropy loss and maximum likelihood in neural networks?

**Answer:**

This connection is one of the most important theoretical insights in deep learning, yet many practitioners don't recognize it explicitly.

**Setup:** Neural network for classification with K classes. Final layer applies softmax. Output: vector of probabilities ŷ = [P(class 1|x), ..., P(class K|x)].

**Cross-entropy loss for a single example:**

L(y, ŷ) = -Σₖ yₖ × log ŷₖ

where y is the one-hot true label (1 for correct class, 0 otherwise). Simplifies to: L = -log ŷ_true_class.

**This IS maximum likelihood estimation:**

Model predicts P(Y=k|x; θ) = ŷₖ for each class. The likelihood of the correct label y for a single example is:

P(Y=y|x; θ) = ŷ_y (probability of the true class)

Log-likelihood = log ŷ_y = -L

Negative log-likelihood = cross-entropy loss.

Minimizing cross-entropy over the training set = Maximizing the likelihood of the training labels = MLE for the model parameters θ.

**For binary classification:**

Loss = -[y × log ŷ + (1-y) × log(1-ŷ)] = binary cross-entropy = negative log-likelihood under Bernoulli distribution.

**For regression with MSE:**

MSE = E[(y - ŷ)²] = negative log-likelihood under Gaussian distribution with unit variance.

**Implication:** Every time you train a neural network, you're doing MLE. The choice of loss function implicitly defines the assumed probability distribution for your outputs. MSE assumes Gaussian output noise. Cross-entropy assumes Categorical/Bernoulli output noise. Mean Absolute Error (MAE) assumes Laplace output noise. Choosing the right loss = choosing the right generative model for your task.

---

### Q49. What is Gaussian Process regression and why is it the "non-parametric Bayesian" approach?

**Answer:**

A **Gaussian Process (GP)** is a distribution over functions — a prior that specifies how "smooth" or "wiggly" functions are expected to be, without committing to a specific parameterized form.

Formally: f ~ GP(m, k) means any finite collection of function values {f(x₁), ..., f(xₙ)} follows a multivariate Gaussian distribution:

f = [f(x₁), ..., f(xₙ)] ~ Normal(m(X), K(X, X))

where m(x) is the mean function (usually 0), and K(X, X) is the covariance matrix with K[i,j] = k(xᵢ, xⱼ) (the kernel function).

**The kernel function encodes prior beliefs:**

RBF kernel: k(x, x') = σ² × exp(-||x-x'||² / 2l²)
- σ² = output variance (how much f varies)
- l = length scale (how quickly correlations decay with distance)
- Functions are smooth (nearby inputs have similar outputs)

**GP posterior (prediction with uncertainty):**

Given training data (X, y) and test point x*:

P(f* | x*, X, y) = Normal(μ*, σ*²)

μ* = K(x*, X) × [K(X,X) + σ²I]⁻¹ × y  ← posterior mean (best prediction)
σ*² = k(x*, x*) - K(x*, X) × [K(X,X) + σ²I]⁻¹ × K(X, x*)  ← posterior variance

**Key properties:**

- Prediction is the interpolation of training points weighted by kernel similarity.
- Uncertainty is LOW near training data (σ*² → 0 as x* approaches training points).
- Uncertainty is HIGH far from training data — exactly what Bayesian uncertainty should look like!

**Connection to kernel methods:** GP regression with RBF kernel = Bayesian interpretation of kernel ridge regression. The kernel trick computes implicit infinite-dimensional feature inner products; GP gives the Bayesian posterior over that infinite-dimensional parameter space.

**Why GP for hyperparameter optimization (Bayesian optimization):**

GP models the black-box function (model performance vs. hyperparameters) as a smooth function. The posterior gives a mean (expected performance) and variance (uncertainty) at unqueried hyperparameter values. Acquisition functions use this to choose which hyperparameters to try next — balancing exploration (high uncertainty regions) and exploitation (high expected performance regions).

---

### Q50. What is the information bottleneck principle and what does it say about deep learning?

**Answer:**

The **information bottleneck (IB) principle** (Tishby & Pereira, 1999) provides a framework for understanding what a good representation Z of input X should be, for predicting target Y.

**The IB objective:** Find representation Z that:
1. **Compresses X:** Minimize I(X; Z) — representation should discard irrelevant information about X.
2. **Preserves Y-relevant information:** Maximize I(Z; Y) — representation should retain all predictive information about Y.

Combined as a trade-off: max I(Z; Y) - β × I(X; Z)

where β controls the compression-prediction trade-off.

**The IB curve:** As β increases (more compression), I(X; Z) decreases (better compression), but I(Z; Y) also eventually decreases (loses predictive power). The Pareto-optimal front of this trade-off is the "information bottleneck curve."

**Application to deep learning:**

Tishby et al. (2017) proposed that neural network training has two phases visible through the mutual information lens:

Phase 1 (empirical risk minimization): Both I(Z; Y) and I(X; Z) increase rapidly. Network fits the training data.

Phase 2 (representation compression): I(Z; Y) stabilizes while I(X; Z) decreases. Network learns to forget input details irrelevant to the task.

**Implication:** The "double descent" phenomenon in deep learning — where generalization improves after overfitting — may correspond to this compression phase. Networks start by fitting noise (high I(X;Z), including noise), then compression removes noisy information.

**Practical implications:**

- Dropout may work partly by forcing information compression — randomly dropped units can't memorize specific training inputs.
- Batch normalization standardizes activations, potentially aiding the compression process.
- The representation in the penultimate layer should be a maximally compressed sufficient statistic for the target.
- Disentangled representations (VAEs with different β values) correspond to different points on the IB curve.

**Controversy:** The specific claim about two-phase training in deep networks is debated — whether the compression phase truly occurs with SGD and modern architectures is an open question. But the IB framework as a theoretical lens for understanding representation quality remains highly influential.

---

## Quick Reference

### Distributions Cheat Sheet
| Distribution | Support | Mean | Variance | Used for |
|---|---|---|---|---|
| Bernoulli(p) | {0,1} | p | p(1-p) | Binary label |
| Binomial(n,p) | {0,...,n} | np | np(1-p) | Count of successes |
| Poisson(λ) | {0,1,2,...} | λ | λ | Event counts |
| Normal(μ,σ²) | ℝ | μ | σ² | Continuous measurements |
| Beta(α,β) | [0,1] | α/(α+β) | see formula | Probability estimation |
| Dirichlet(α) | simplex | αᵢ/Σαⱼ | see formula | Mixture weights |
| Exponential(λ) | ℝ⁺ | 1/λ | 1/λ² | Inter-event times |

### Loss Functions and Their Statistical Interpretation
| Loss Function | Distribution Assumed | Task |
|---|---|---|
| MSE | Gaussian noise | Regression |
| MAE | Laplace noise | Robust regression |
| Binary cross-entropy | Bernoulli | Binary classification |
| Categorical cross-entropy | Categorical | Multi-class |
| KL divergence | — | Distribution matching (VAE) |
| Hinge loss | — | Margin maximization (SVM) |

### Test Selection Guide
| Situation | Test |
|---|---|
| Compare two model means, paired | Paired t-test |
| Compare two models, binary outcomes | McNemar's test |
| Feature importance for categorical target | Chi-square test |
| Feature importance for continuous target | Pearson correlation or MI |
| Comparing distributions | KS test |
| Non-parametric paired comparison | Wilcoxon signed-rank |

---

*End of ML Probability & Statistics — 50 questions from foundations to advanced theory.*
