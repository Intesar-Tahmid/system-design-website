# Question Tracker

> **Workflow for adding questions:**
> 1. Check "Next Available ID" below — use that as your starting Q number
> 2. Look at the chapter's "Topics covered" to avoid duplicates
> 3. Add questions to the correct markdown file at the end of the chapter section
> 4. Update "Next Available ID" and the chapter's topic list
> 5. Commit with `feat: add N questions to [chapter names]`

## Next Available ID: Q405

## Source Books
- 📘 **AX1** = Alex Xu, *System Design Interview Vol. 1*
- 📗 **AX2** = Alex Xu, *System Design Interview Vol. 2*
- 📙 **DDIA** = Martin Kleppmann, *Designing Data-Intensive Applications*

---

## File 1: system_design_1.md — Foundations

### Ch1 · Web Fundamentals (Q1–Q6, Q189–Q193, Q294–Q296)
**Topics covered:** URL browser flow, HTTP vs HTTPS, status codes, HTTP methods (GET/POST/PUT/PATCH/DELETE), REST API, cookies/localStorage/sessionStorage, URL/URI/URN, HTTP caching & Cache-Control headers, idempotency in HTTP, content negotiation, same-origin policy, TLS handshake, authentication vs authorization, HTTP/2 multiplexing

---

### Ch2 · Browser Internals & DevTools (Q7–Q12, Q194–Q198, Q297–Q299)
**Topics covered:** DOM, Inspect Element, Network tab, Console tab, CSR vs SSR, Static Site Generation, critical rendering path, reflow vs repaint, Web Workers, Performance tab, browser caching & cache busting, service workers & PWA, lazy loading, JavaScript event loop

---

### Ch3 · Networking Basics (Q13–Q18, Q199–Q203, Q300–Q302)
**Topics covered:** DNS, TCP vs UDP, CDN, WebSockets, CORS, proxy & reverse proxy, OSI model, IPv4 vs IPv6, VPN, firewalls, latency vs bandwidth, SSL/TLS termination, IP fragmentation, Anycast vs Unicast

---

### Ch4 · Server-Side Concepts (Q19–Q24, Q204–Q208, Q303–Q305)
**Topics covered:** monolith vs microservices, load balancer, horizontal vs vertical scaling, message queue, Docker, Kubernetes, serverless, long-polling vs SSE vs WebSockets, sticky sessions vs stateless, sidecar pattern, graceful shutdown, K8s liveness/readiness/startup probes, container registry, daemon vs foreground process

---

### Ch5 · Databases (Q25–Q29, Q209–Q213, Q306–Q308)
**Topics covered:** SQL vs NoSQL, database indexes, ACID properties, sharding, replication, transactions (COMMIT/ROLLBACK), primary/foreign/unique keys, ORMs, database migrations, DELETE/TRUNCATE/DROP, normalization & normal forms, optimistic vs pessimistic locking, full-text search indexes

---

### Ch6 · Caching (Q30–Q32, Q214–Q218, Q309–Q311)
**Topics covered:** importance of caching, cache invalidation, Redis use cases, write-through/write-back/write-around, cache hit ratio, distributed caching, cache stampede, application cache vs CDN cache, LRU/LFU/FIFO eviction policies, cache warming, cache coherence

---

### Ch7 · Scalability & Load Balancing (Q33–Q35, Q219–Q223, Q312–Q314)
**Topics covered:** CAP theorem, eventual consistency, rate limiting, load balancing algorithms, read replicas, auto-scaling, geographic load balancing (GeoDNS), stateful vs stateless LB, connection draining, N-tier architecture, health checks in LB

---

### Ch8 · Microservices & APIs (Q36–Q39, Q224–Q228, Q315–Q317)
**Topics covered:** API Gateway, GraphQL vs REST, gRPC, service discovery, bulkhead pattern, API versioning, CQRS, BFF (Backend for Frontend), idempotency key, event-driven architecture, API composition pattern, distributed transactions

---

### Ch9 · Message Queues & Async Systems (Q40–Q41, Q229–Q233, Q318–Q320)
**Topics covered:** Apache Kafka, message queue vs event stream, DLQ (dead letter queue), pub/sub vs point-to-point, RabbitMQ vs Kafka, message ordering, outbox pattern, consumer groups in Kafka, delivery semantics (at-least/at-most/exactly-once), message prioritization

---

### Ch10 · Security (Q42–Q45, Q234–Q238, Q321–Q323)
**Topics covered:** JWT, OAuth 2.0, SQL injection, XSS, CSRF, encryption at rest vs transit, zero-trust architecture, MITM attacks & TLS certificates, API keys vs JWT vs session tokens, secrets management, principle of least privilege, security headers

---

### Ch11 · Advanced System Design (Q46–Q64, Q239–Q243, Q324–Q326)
**Topics covered:** URL shortener, Twitter/X feed, consistent hashing, Saga pattern, circuit breaker, CDN cache invalidation, sync vs async, Elasticsearch, WAL, distributed lock, observability, connection pooling, eventual vs strong consistency, bloom filter, push vs pull, high availability, strangler fig, backpressure, feature flags, Dropbox design, 2PC, notification system, geo-replication, distributed task scheduler, rate limiter design (AX1 ch4), distributed key-value store (AX1 ch6, DDIA), web crawler design (AX1 ch9)

---

## File 2: system_design_2.md — DevOps & MLOps

### Ch12 · DevOps & Infrastructure (Q65–Q68, Q244–Q248, Q327–Q329)
**Topics covered:** IaC, containerization vs virtualization, service mesh, GitOps, config management (Ansible/Chef), immutable infrastructure, VPC & network isolation, multi-cloud vs hybrid cloud, service mesh (Envoy/Istio), Helm & Kubernetes deployment, infrastructure drift, deployment environment strategy (dev/staging/prod)

---

### Ch13 · CI/CD Pipelines (Q69–Q70, Q249–Q253, Q330–Q332)
**Topics covered:** CI/CD stages, canary deployment, trunk-based development, rollback strategies, continuous delivery vs deployment, DB schema migrations in pipelines, GitFlow vs trunk-based, smoke tests, artifact versioning & semantic versioning, secrets injection in CI/CD

---

### Ch14 · Monitoring & Observability (Q71–Q73, Q254–Q258, Q333–Q335)
**Topics covered:** SLOs/SLAs/SLIs, chaos engineering, distributed tracing, logs vs metrics vs traces, alerting fatigue, synthetic vs RUM monitoring, runbooks, service dependency graphs, four golden signals, USE method, error budget burn rate

---

### Ch15 · MLOps Fundamentals (Q74–Q76, Q259–Q263, Q336–Q338)
**Topics covered:** MLOps vs DevOps, model drift, feature engineering & feature stores, ML model lifecycle, concept drift vs data drift, reproducibility, model artifacts, ML vs software pipelines, model cards, ML model governance, AutoML

---

### Ch16 · Data Pipelines & ETL (Q77–Q78, Q264–Q268, Q339–Q341)
**Topics covered:** ETL vs ELT, data lake vs data warehouse, CDC (Change Data Capture), idempotent pipelines, backfilling, pipeline orchestrators (Airflow/Prefect/Dagster), stream vs batch processing, slowly changing dimensions (SCD), data deduplication, data contracts

---

### Ch17 · Feature Engineering & Serving (Q79–Q80, Q269–Q273, Q342–Q344)
**Topics covered:** online vs offline feature serving, model inference approaches, feature drift, point-in-time correctness, feature selection vs extraction, embeddings in production, normalization vs standardization, target encoding & leakage risks, feature transformation pipeline & training-serving skew, dimensionality reduction

---

### Ch18 · Model Training & Experimentation (Q81–Q82, Q274–Q278, Q345–Q347)
**Topics covered:** hyperparameter tuning, cross-validation, distributed training (data/model parallelism), gradient checkpointing, learning rate schedulers, early stopping, bias-variance trade-off, bagging vs boosting, data augmentation, catastrophic forgetting

---

### Ch19 · AI/ML System Design (Q83–Q86, Q279–Q283, Q348–Q350)
**Topics covered:** recommendation systems, anomaly detection, neural network training at scale, transfer learning, fraud detection system, search ranking system, content moderation, personalization engine, feature platform, real-time bidding system, video recommendation system (AX2), metrics monitoring system (AX2)

---

### Ch20 · Inference & Serving (Q87–Q88, Q284–Q288, Q351–Q353)
**Topics covered:** batch vs stream ML processing, LLM deployment, model quantization, dynamic batching, prediction caching, model canary deployment, serving infrastructure, model warm-up & cold start, speculative decoding, GPU memory management

---

### Ch21 · Data Quality & Monitoring (Q89–Q92, Q289–Q293, Q354–Q356)
**Topics covered:** data validation, model monitoring metrics, data versioning, experiment tracking, schema validation, completeness vs accuracy vs consistency, pipeline anomaly detection, data lineage, statistical process control (SPC), data observability, data profiling, monitoring ML performance without ground truth

---

## File 3: system_design_3.md — Advanced Topics

### Ch22 · Database Selection (Q93–Q97, Q357–Q359)
**Topics covered:** choosing the right database, PostgreSQL depth, MongoDB pitfalls, Redis beyond caching, Elasticsearch for ML, time-series databases (InfluxDB/TimescaleDB), graph databases (Neo4j), NewSQL (CockroachDB/Spanner)

---

### Ch23 · Scaling by Users (Q98, Q360–Q362)
**Topics covered:** architecture evolution 100→1M→1B users, read-heavy vs write-heavy workloads, horizontal session management challenge, cell-based architecture

---

### Ch24 · Requirements-Based System Design (Q99–Q101, Q363–Q365)
**Topics covered:** 6-step design framework, CAP theorem in real systems, server/DB estimation, non-functional requirements, data modeling in interviews, common interview mistakes

---

### Ch25 · Network & Protocol Deep Dives (Q102–Q104, Q366–Q368)
**Topics covered:** HTTP/1.1 vs 2 vs 3, gRPC vs REST vs GraphQL for ML, webhooks, QUIC protocol, mTLS for service-to-service auth, DNS-based vs service registry discovery

---

### Ch26 · Storage Systems (Q105–Q106, Q369–Q371)
**Topics covered:** S3 object storage, message broker vs event streaming, block vs file vs object storage, RAID, storage tiering & cost optimization

---

### Ch27 · Advanced MLOps (Q107–Q110, Q372–Q374)
**Topics covered:** model registry, shadow mode deployment, online vs batch learning, data labeling at scale, continuous training (CT), model rollback vs software rollback, multi-armed bandit vs A/B testing

---

### Ch28 · Security for ML/AI Systems (Q111–Q112, Q375–Q377)
**Topics covered:** prompt injection, model poisoning, differential privacy, model extraction attacks, data poisoning detection

---

### Ch29 · Cost Engineering (Q113–Q117, Q378–Q380)
**Topics covered:** cloud cost reduction, Python ML observability, sync vs async Python, Python ML patterns, training/serving data consistency, spot vs on-demand vs reserved instances, model compression, FinOps for ML

---

## File 4: system_design_4.md — Deep Dives

### Ch30 · Distributed Systems Theory (Q118–Q130, Q381–Q383)
**Topics covered:** Two Generals Problem, Fallacies of Distributed Computing, consensus, process/thread/coroutine in Python, backpressure, latency/throughput/bandwidth, head-of-line blocking, thundering herd, vector clocks, stateful vs stateless services, actor model, idempotency, N+1 query, linearizability vs serializability (DDIA), fencing tokens for distributed locks (DDIA), total order broadcast (DDIA)

---

### Ch31 · Database Internals (Q131–Q140, Q384–Q386)
**Topics covered:** B-Tree index, transaction isolation levels, optimistic vs pessimistic locking, normalization rules for ML, columnar databases, WAL, database vacuuming, sharding vs partitioning, materialized views, connection pooling, LSM tree & RocksDB (DDIA), MVCC, covering indexes

---

### Ch32 · ML System Design Theory (Q141–Q150, Q387–Q389)
**Topics covered:** explore-exploit trade-off, cold start in recommendations, model calibration, precision/recall threshold selection, multi-label vs multi-class, accuracy vs fairness, federated learning, discriminative vs generative models, gradient descent variants, regularization (L1/L2/dropout), Pareto frontier in multi-objective ML, training-serving skew, class imbalance techniques

---

### Ch33 · Data Engineering Concepts (Q151–Q158, Q390–Q392)
**Topics covered:** Lambda Architecture, data lineage, event sourcing, exactly-once processing, schema evolution, OLTP vs OLAP, data mesh, medallion architecture, data catalogs, watermarking in stream processing, row-oriented vs column-oriented storage (DDIA)

---

### Ch34 · Reliability & Operations (Q159–Q162, Q393–Q395)
**Topics covered:** RTO vs RPO, MTTD vs MTTR, blue-green vs rolling deployment, error budget, availability vs reliability, graceful degradation, post-mortems

---

### Ch35 · AI Product & Architecture (Q163–Q170, Q396–Q398)
**Topics covered:** RAG, prompt engineering, fine-tuning/instruction tuning/RLHF, AI agents, vector databases, model distillation, zero-shot/one-shot/few-shot, responsible AI, RAG vs fine-tuning comparison, multi-agent systems challenges, LLM token economics

---

### Ch36 · Organizational & Process (Q171–Q175, Q399–Q401)
**Topics covered:** technical debt in ML, principle of least privilege, documentation-as-code, 12-factor app, eventual consistency in distributed caches, Conway's Law, DORA metrics, build vs buy for ML tooling

---

### Ch37 · Emerging Patterns & Edge Cases (Q176–Q188, Q402–Q404)
**Topics covered:** multimodal ML, cold start for ML models, online vs offline evaluation, PACELC theorem, weak vs strong isolation in experiments, shadow mode vs champion-challenger, randomness/seeds in ML, data freshness, SLO for ML inference, explainability, data scientist vs ML engineer vs MLOps, GPU memory hierarchy, accuracy vs robustness vs reliability, digital twins for ML, model collapse & synthetic data risks, AI safety engineering in production
