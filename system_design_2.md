# System Design Mastery Extended: DevOps, MLOps, and AI/ML Systems
### Questions 65-150+ for Advanced System Design

> **How to use this guide:** Continue from Question 65. These questions dive deep into operational concerns, machine learning workflows, and modern AI system architectures. Each includes detailed answers and concrete examples.

---

## Table of Contents

1. [DevOps & Infrastructure](#devops--infrastructure)
2. [CI/CD Pipelines](#cicd-pipelines)
3. [Monitoring & Observability](#monitoring--observability)
4. [MLOps Fundamentals](#mlops-fundamentals)
5. [Data Pipelines & ETL](#data-pipelines--etl)
6. [Feature Engineering & Serving](#feature-engineering--serving)
7. [Model Training & Experimentation](#model-training--experimentation)
8. [AI/ML System Design](#aiml-system-design)
9. [Inference & Serving](#inference--serving)
10. [Data Quality & Monitoring](#data-quality--monitoring)

---

## DevOps & Infrastructure

---

### Q65. What is Infrastructure as Code (IaC) and why is it important?

**Answer:**

**Infrastructure as Code** is the practice of managing and provisioning computing infrastructure (servers, databases, networks, security groups) by writing code instead of manually clicking through cloud provider dashboards. The infrastructure definition becomes versioned, reviewable, and reproducible like application code.

**Benefits:**
1. **Reproducibility** — Deploy identical infrastructure across dev, staging, and production.
2. **Version Control** — Track all changes to infrastructure in Git.
3. **Disaster Recovery** — Rebuild entire infrastructure from code in minutes.
4. **Scaling** — Change a variable from `instance_count = 1` to `instance_count = 100`.
5. **Documentation** — The code IS the documentation of what infrastructure exists.

**Popular IaC Tools:**
- **Terraform** — Cloud-agnostic, declarative, state-based.
- **CloudFormation** — AWS-native YAML/JSON templates.
- **Ansible** — Imperative, procedural, no state management.
- **Pulumi** — Write IaC in programming languages (Python, Go, TypeScript).

**Example (Terraform):**

```hcl
# infrastructure.tf

provider "aws" {
  region = "us-east-1"
}

# VPC (Virtual Private Cloud)
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "main-vpc" }
}

# Public Subnet
resource "aws_subnet" "public" {
  vpc_id              = aws_vpc.main.id
  cidr_block          = "10.0.1.0/24"
  availability_zone   = "us-east-1a"
  map_public_ip_on_launch = true

  tags = { Name = "public-subnet" }
}

# RDS Database
resource "aws_db_instance" "postgres" {
  allocated_storage      = 20
  db_name                = "myapp_db"
  engine                 = "postgres"
  engine_version         = "15.3"
  instance_class         = "db.t3.micro"
  username               = "admin"
  password               = var.db_password  # From terraform.tfvars
  parameter_group_name   = "default.postgres15"
  skip_final_snapshot    = false
  multi_az               = true  # High availability

  tags = { Name = "prod-database" }
}

# EC2 Instance
resource "aws_instance" "app_server" {
  ami                 = "ami-0c55b159cbfafe1f0"  # Ubuntu 22.04
  instance_type       = var.instance_type  # e.g., "t3.medium"
  subnet_id           = aws_subnet.public.id
  security_groups     = [aws_security_group.app.id]

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io
              systemctl start docker
              docker run -d -p 3000:3000 myapp:latest
              EOF

  tags = { Name = "app-server-1" }
}

# Auto Scaling Group (spawn 2-10 instances based on load)
resource "aws_autoscaling_group" "app" {
  launch_configuration = aws_launch_configuration.app.id
  min_size             = 2
  max_size             = 10
  desired_capacity     = 3
  vpc_zone_identifier  = [aws_subnet.public.id]

  tag {
    key                 = "Name"
    value               = "app-instance"
    propagate_launch_configuration = true
  }
}

# Outputs — values that are printed after apply
output "database_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "Database connection string"
}

output "load_balancer_dns" {
  value       = aws_lb.main.dns_name
  description = "URL to access the application"
}
```

```bash
# Deploy this infrastructure:
terraform init          # Download AWS provider
terraform plan          # Preview changes
terraform apply         # Create everything (VPC, subnet, RDS, EC2, ASG)

# Output:
# Apply complete! Resources added: 7
# database_endpoint = myapp-db.xxxxx.us-east-1.rds.amazonaws.com:5432
# load_balancer_dns = app-lb-xxxxx.us-east-1.elb.amazonaws.com

# Later, scale up:
# Edit main.tf: desired_capacity = 10
terraform apply  # ASG grows to 10 instances

# Destroy everything (useful for dev environments):
terraform destroy
```

---

### Q66. What is containerization and how does it differ from virtualization?

**Answer:**

**Virtualization (VM)** — Emulates an entire machine, including its own OS kernel, on top of a hypervisor. Heavy, slow to start, wasteful.

**Containerization (Docker)** — Packages only your application + dependencies + minimal runtime. Shares the host OS kernel. Lightweight, starts in seconds.

**Key difference:**

```
Virtualization (VirtualBox, VMware):
Host OS
  ├── Hypervisor
  │   ├── Guest OS (Linux kernel)
  │   │   ├── App A
  │   │   └── App B
  │   ├── Guest OS (Linux kernel)
  │   │   └── App C
  │   └── Guest OS (Windows kernel)
  │       └── App D

Containerization (Docker):
Host OS (Linux kernel) ← shared by all containers!
  ├── Container A (App A + libs)
  ├── Container B (App B + libs)
  ├── Container C (App C + libs)
  └── Container D (App D + libs)

VM overhead: 4 × ~2GB RAM (one OS per VM)
Container overhead: 4 × ~50MB RAM (just the app)
```

**Containers are faster, lighter, and more efficient, but less isolated than VMs.**

**Example:**

```dockerfile
# Dockerfile for a Node.js app
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Run the app
CMD ["node", "server.js"]
```

```bash
# Build the image (~500MB)
docker build -t myapp:1.0 .

# Run the container (starts in ~1 second)
docker run -d -p 3000:3000 myapp:1.0

# Run 100 copies simultaneously
for i in {1..100}; do
  docker run -d -p $((3000+i)):3000 myapp:1.0
done
# Total time: ~5 seconds
# Total RAM: ~5GB (50MB per container)
# With VMs: 100 × 2GB = 200GB RAM needed!
```

---

### Q67. What is a service mesh and what problem does it solve?

**Answer:**

A **service mesh** is a dedicated infrastructure layer that handles service-to-service communication in a microservices environment. It sits between your services and the network, transparently managing traffic, security, and observability.

**The problem:** With hundreds of microservices, each service needs to handle:
- Retries on failure
- Load balancing across instances
- Timeouts
- Circuit breaking
- Authentication/authorization
- Encryption
- Distributed tracing
- Rate limiting

Implementing this in each service leads to duplicated, buggy code.

**The solution:** A service mesh (like Istio or Linkerd) handles all this **at the infrastructure level**, not in application code.

**How it works:** Every service has a **sidecar proxy** (e.g., Envoy) that intercepts all network traffic. The mesh control plane configures these proxies centrally.

**Example (Istio on Kubernetes):**

```yaml
# VirtualService — Traffic management rules
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: orders-service
spec:
  hosts:
  - orders    # DNS name of the service
  http:
  - match:    # Route requests from "alice" user ID
    - sourceLabels:
        user-id: alice
    route:
    - destination:
        host: orders
        port:
          number: 8080
        subset: v2   # Send Alice to v2 (newer version)
  - route:    # Send everyone else to v1
    - destination:
        host: orders
        subset: v1
      weight: 70   # 70% of traffic
    - destination:
        host: orders
        subset: v2
      weight: 30   # 30% of traffic (canary deployment)

---

# DestinationRule — How to access the service
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: orders-service
spec:
  host: orders
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 1000
      http:
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
    loadBalancer:
      simple: LEAST_REQUEST  # Least connections algorithm
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s   # Circuit breaker config
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2

---

# PeerAuthentication — Mutual TLS (mTLS)
# All traffic between services is encrypted
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
spec:
  mtls:
    mode: STRICT  # Enforce mTLS, reject non-encrypted traffic
```

**Result:** Without code changes:
- Automatic load balancing ✅
- Circuit breaking ✅
- Mutual TLS encryption ✅
- Canary deployments (70/30 split) ✅
- Automatic retries ✅
- Distributed tracing ✅
- Rate limiting ✅

---

### Q68. What is GitOps and how does it differ from traditional CI/CD?

**Answer:**

**GitOps** is a paradigm where **Git is the single source of truth for your entire system state** — not just code, but infrastructure, deployments, configurations, everything. Any desired change is made as a Git commit, and automated tools synchronize the actual system to match Git.

**Traditional CI/CD:**
```
Developer → Push code → CI builds artifact → CD deploys to prod
(Manual approval steps, Jenkins/GitLab pipelines)
```

**GitOps:**
```
Developer → Push code + config change to Git → 
Operator (ArgoCD/Flux) detects change → 
Operator applies change to cluster → 
Cluster state matches Git state
```

**Key principles:**
1. **Declarative** — Git defines desired state, not imperative commands.
2. **Versioned & Immutable** — All changes tracked, rollback is just a git revert.
3. **Observable** — Git diff shows exactly what will change before applying.
4. **Automated Reconciliation** — Operator continuously syncs cluster to Git.

**Example (ArgoCD):**

```bash
# Directory structure in Git
my-app-repo/
├── apps/
│   ├── frontend/
│   │   ├── kustomization.yaml
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   ├── api/
│   │   ├── kustomization.yaml
│   │   └── deployment.yaml
│   └── database/
│       ├── statefulset.yaml
│       └── pvc.yaml
└── argocd/
    └── application.yaml
```

```yaml
# argocd/application.yaml — Describes what to deploy
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/my-app-repo
    targetRevision: main  # Watch the main branch
    path: apps/           # Deploy from this directory
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true         # Delete resources removed from Git
      selfHeal: true      # Sync if cluster drifts from Git
      syncInterval: 3m    # Sync every 3 minutes
    syncOptions:
    - CreateNamespace=true
```

```bash
# Workflow:
# 1. Developer updates app version in Git:
#    image: myapp:v1.5.0 → image: myapp:v1.6.0

# 2. Push to Git:
git commit -am "Bump app to v1.6.0"
git push origin main

# 3. ArgoCD detects change, automatically syncs:
# (Kubernetes now runs v1.6.0)

# 4. Check status:
argocd app get my-app
# Sync Status:   Synced ✓
# Health Status: Healthy

# 5. Rollback is just:
git revert <commit>
git push
# ArgoCD automatically rolls back to previous version
```

**Advantages over traditional CI/CD:**
- Complete audit trail (every change in Git history).
- Environment reproducibility (same Git commit → same environment).
- Pull request reviews for infrastructure changes.
- Faster disaster recovery (redeploy from Git).
- Declarative instead of imperative (clearer intent).

---

## CI/CD Pipelines

---

### Q69. What is a CI/CD pipeline and what are its stages?

**Answer:**

A **CI/CD pipeline** is an automated sequence of steps that builds, tests, and deploys code changes from development to production.

**CI (Continuous Integration):**
- Developer commits code → Automated build → Automated tests run.
- If tests fail, developer is notified immediately.
- Goal: Catch bugs early, keep the main branch always deployable.

**CD (Continuous Deployment or Continuous Delivery):**
- **Delivery:** Automated deployment to staging, manual approval to prod.
- **Deployment:** Automatic deployment all the way to production.

**Typical pipeline stages:**

```
1. Trigger (on push to main/PR)
   ↓
2. Checkout code
   ↓
3. Build (compile, bundle, docker build)
   ↓
4. Unit Tests
   ↓
5. Static Analysis (SonarQube, linting)
   ↓
6. Build Artifact (create docker image, JAR, ZIP)
   ↓
7. Push to Registry (Docker Hub, ECR, Artifactory)
   ↓
8. Deploy to Staging (automatic)
   ↓
9. Integration Tests (against staging)
   ↓
10. Smoke Tests (sanity checks)
    ↓
11. Performance Tests (optional)
    ↓
12. Manual Approval (QA, manager clicks "approve")
    ↓
13. Deploy to Production (canary or blue-green)
    ↓
14. Health Checks (verify prod is healthy)
    ↓
15. Notify team (Slack: "Deployment successful")
```

**Example (GitHub Actions):**

```yaml
# .github/workflows/ci-cd.yml

name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Build Docker image
      if: github.event_name == 'push'
      run: |
        docker build -t ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} .
        docker tag ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
                   ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
    
    - name: Push to registry
      if: github.event_name == 'push'
      run: |
        echo ${{ secrets.GITHUB_TOKEN }} | docker login ${{ env.REGISTRY }} -u ${{ github.actor }} --password-stdin
        docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
        docker push ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
    
    - name: Deploy to staging
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      run: |
        kubectl set image deployment/app-staging \
          app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
          --record
        kubectl rollout status deployment/app-staging
    
    - name: Run smoke tests against staging
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      run: npm run test:smoke -- --baseUrl=${{ secrets.STAGING_URL }}
    
    - name: Manual approval to production
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      uses: trstringer/manual-approval@v1
      with:
        secret: ${{ secrets.GITHUB_TOKEN }}
        approvers: 'devops-team'
        issue-title: 'Approve production deployment for ${{ github.sha }}'
    
    - name: Deploy to production (blue-green)
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      run: |
        # Switch "green" deployment to new version
        kubectl set image deployment/app-green \
          app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
          --record
        kubectl rollout status deployment/app-green
        
        # Run health checks
        ./scripts/health-check.sh ${{ secrets.PROD_URL }}
        
        # Switch traffic from "blue" to "green"
        kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'
    
    - name: Notify Slack
      if: always()
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: 'Deployment ${{ job.status }}'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

### Q70. What is a canary deployment?

**Answer:**

A **canary deployment** gradually rolls out a new version to a small subset of users first, monitors for issues, and then expands to all users if successful.

**Why "canary"?** In coal mines, canaries were sent in first to detect toxic gas. Same principle: test new code with a small group first.

**Deployment strategies:**

```
Blue-Green:
- Blue (old): 100% of traffic
- Deploy Green (new): 0% of traffic initially
- Run health checks
- Switch: Green 100%, Blue 0%
- Instant rollback possible by switching back
- Problem: All users hit new version at once

Canary:
- Version 1: 95% of traffic
- Version 2 (new): 5% of traffic
- Monitor: error rate, latency, resource usage
- If metrics look good: increase to 10%, then 25%, then 50%, then 100%
- If issues detected: automatically rollback the 5% and alert
- Safer: only 5% affected if something breaks

Rolling:
- 10 replicas, v1 running
- Kill 1 replica of v1, start 1 of v2
- Wait 30 seconds, health check passes
- Kill 1 of v1, start 1 of v2
- Repeat until 100% v2
- Slow but zero downtime, gradual rollback possible
```

**Example (Kubernetes with Istio):**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: myapp
spec:
  replicas: 10
  strategy:
    canary:
      steps:
      - setWeight: 10         # 10% of traffic to new version
        duration: 5m          # Monitor for 5 minutes
      - pause: {}             # Manual approval step
      - setWeight: 50         # 50% if approved
        duration: 10m
      - pause: {}
      - setWeight: 100        # 100% rollout
      
      # Automatic rollback on metrics
      analysis:
        interval: 1m
        threshold: 5           # Rollback if 5 metrics fail
        metrics:
        - name: error-rate     # Custom metric
          thresholdValue: "0.05"  # Error rate > 5% = rollback
          interval: 1m
        - name: p99-latency
          thresholdValue: "500"   # p99 latency > 500ms = rollback
          interval: 1m
  
  template:
    spec:
      containers:
      - name: myapp
        image: myapp:v2.0
```

**Real-world example:**

```
10:00 AM - Deploy myapp v2.0 with canary strategy
├─ 5% of traffic → v2.0 (50 out of 1000 req/sec)
├─ 95% of traffic → v1.0 (950 req/sec)
├─ Metrics dashboard shows:
│  ├─ v1.0: error_rate=0.02%, latency_p99=120ms ✓
│  ├─ v2.0: error_rate=0.03%, latency_p99=125ms ✓ (similar, good!)

10:05 AM - Canary OK, increase to 50%
├─ 500 req/sec → v2.0
├─ 500 req/sec → v1.0
├─ Still healthy

10:15 AM - All metrics good, full rollout
├─ 1000 req/sec → v2.0
├─ v1.0 offline

Scenario if bug detected:
10:10 AM - Automated metric shows v2.0 error_rate=8% (threshold=5%)
├─ Automatic rollback triggered
├─ Reduce v2.0 from 50% → 0%
├─ Alert sent: "Canary rollback: error_rate too high"
├─ Investigate the bug, fix, and retry
```

---

## Monitoring & Observability

---

### Q71. What are SLOs, SLAs, and SLIs?

**Answer:**

These are related but distinct concepts for defining and measuring service reliability.

**SLI (Service Level Indicator)** — A **metric** that measures some aspect of service performance.
- Examples: uptime percentage, error rate, latency (p99), throughput.
- Measurable and objective.
- "Our API responds in < 100ms for 99% of requests."

**SLO (Service Level Objective)** — A **target** for an SLI.
- A commitment to users about what reliability they can expect.
- "We will maintain 99.9% uptime (SLI) with response times under 200ms (SLI)."
- Internal commitment (not binding).

**SLA (Service Level Agreement)** — A **legal contract** with penalties for missing SLOs.
- "If we don't meet 99.9% uptime, you get a 10% refund."
- Binding, with financial consequences.

**Example:**

```
Typical SLOs for a web service:

SLI: Availability
- Metric: uptime = (time_served / total_time) × 100%
- SLO: 99.9% availability
- Allowed downtime: 8.7 hours/year, 43 minutes/month, 4.3 minutes/day

SLI: Latency
- Metric: response time at percentile 99 (p99)
- SLO: p99 latency < 100ms
- Measurement: Sample 1000 requests/hour, measure 99th percentile

SLI: Error Rate
- Metric: (errors / total_requests) × 100%
- SLO: < 0.1% error rate
- Example: 1000 requests, max 1 error allowed

SLI: Throughput
- Metric: requests per second
- SLO: support at least 10,000 req/sec at p99 latency < 100ms
```

**Practical implications:**

```
If SLO = 99.9% uptime (8.7 hours/year downtime allowed):

When planning maintenance:
- Only 8.7 hours/year to deploy, patch, upgrade
- Must plan carefully
- Prefer zero-downtime deployments (blue-green, canary)

Error budgets:
- Month: 43 minutes allowed downtime
- If you've had 30 minutes of outages, 13 minutes left
- With 10 days left in month, 1.3 min/day for maintenance
- If error rate SLO = 0.1% and you're at 0.05%, you can "afford" another 0.05%
- Use this budget for deploying risky changes

Monitoring:
- Must track SLIs in real-time
- Alert if trending toward SLO breach
- If error rate is usually 0.02% and spikes to 0.08%, alert immediately
```

---

### Q72. What is a chaos engineering test and why run them?

**Answer:**

**Chaos Engineering** is the practice of deliberately injecting failures into production (or staging) systems to discover weaknesses and improve resilience. The hypothesis: "If our system is resilient, small controlled failures won't cause outages."

**Common failures to inject:**
- Kill a random pod/instance (instance failure).
- Introduce network latency (slow connections).
- Drop network packets (packet loss).
- Kill a dependency service (database down, API unavailable).
- Reduce available memory/CPU (resource constraint).
- Inject random errors into responses (chaos monkey).

**Tools:** Gremlin, Chaos Toolkit, Pumba, Kubernetes-native tools like Chaos Mesh.

**Example (Chaos Mesh on Kubernetes):**

```yaml
# Scenario: Kill a random pod every 30 seconds
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: kill-random-pod
  namespace: production
spec:
  action: pod-kill  # Or pod-failure for non-zero exit
  mode: fixed
  value: 1          # Kill 1 pod at a time
  duration: 5m      # Run for 5 minutes
  scheduler:
    cron: "@every 30s"  # Kill every 30 seconds
  selector:
    namespaces:
    - production
    labelSelectors:
      app: orders-service

---

# Scenario: Network latency — add 500ms to all requests to database
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: add-latency
spec:
  action: delay
  mode: all
  duration: 10m
  delay:
    latency: "500ms"  # Add 500ms delay
    jitter: "50ms"    # Random variance ±50ms
  selector:
    namespaces:
    - production
    labelSelectors:
      app: database

---

# Scenario: Packet loss — lose 10% of packets
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: packet-loss
spec:
  action: loss
  mode: all
  loss:
    loss: "10%"       # Lose 10% of packets
  duration: 5m
  selector:
    namespaces:
    - production
    labelSelectors:
      tier: backend
```

**Workflow:**

```
1. Run test in production (or staging)
2. Inject chaos: Kill a pod, slow down DB, etc.
3. Observe: Does the service recover automatically?
4. Measure: Did latency spike? Did error rate increase?
5. Analyze:
   - If service recovered: Resilience is working ✓
   - If service degraded but didn't crash: Partial resilience
   - If service crashed: Found a weakness! Fix it.
6. Iterate

Example: Kill a database pod
├─ Expected: Circuit breaker activates
├─        → Read traffic shifts to replicas
├─        → User experiences slight latency increase (~100ms) but no errors
├─ Actual: Database pod killed
├─        → Latency spikes to 5000ms (circuits not kicking in fast enough!)
├─        → Error rate goes to 5% for 10 seconds
├─ Finding: Circuit breaker timeout is too high (should be 1s, is 5s)
├─ Fix: Lower timeout in Istio config
└─ Retest: Now recovers in 2 seconds ✓
```

---

### Q73. What is distributed tracing and how does it work?

**Answer:**

**Distributed tracing** tracks a single request as it flows through multiple microservices, showing timing and dependencies. It answers: "Why was this request slow?" and "Which service caused the error?"

**Key concept: Trace context propagation**

Each request gets a unique **Trace ID**. This ID is passed between services in HTTP headers. Each service records **spans** (segments of work) with timing and metadata.

**Example trace ID propagation:**

```
Request from client:
GET /api/order/123

Trace ID: abc-def-ghi-123

Service A (Orders) receives request:
├─ Span: "receive_request" (0ms)
├─ Span: "validate_order" (2ms)
├─ Call to Service B, pass trace ID in header:
│  GET /api/payment/charge HTTP/1.1
│  Trace-ID: abc-def-ghi-123  ← same trace ID
│
│  Service B (Payment) receives:
│  ├─ Span: "charge_credit_card" (200ms) ← slow!
│  └─ Span: "update_balance" (5ms)
│  └─ Response: 200 OK
│
├─ Span: "process_response" (1ms)
├─ Call to Service C, pass trace ID:
│
│  Service C (Notifications) receives:
│  ├─ Span: "send_email" (50ms)
│  └─ Span: "log_event" (1ms)
│
└─ Span: "send_response" (1ms)

Total request time: 260ms
Breakdown in Jaeger UI:
├─ Orders: 5ms (network overhead + parsing)
├─ Payment: 200ms ← bottleneck!
├─ Notifications: 50ms
```

**Example (OpenTelemetry with Jaeger):**

```python
# Python: Auto-instrumented with middleware
from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

# Setup Jaeger exporter
jaeger_exporter = JaegerExporter(
    agent_host_name="jaeger-agent",
    agent_port=6831,
)

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

# Auto-instrument Flask and requests
FlaskInstrumentor().instrument()
RequestsInstrumentor().instrument()

app = Flask(__name__)

@app.route('/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    tracer = trace.get_tracer(__name__)
    
    with tracer.start_as_current_span("get_order") as span:
        span.set_attribute("order_id", order_id)
        
        with tracer.start_as_current_span("fetch_from_db"):
            order = db.query(f"SELECT * FROM orders WHERE id={order_id}")
        
        with tracer.start_as_current_span("fetch_user"):
            # This HTTP call automatically includes trace context in headers
            user_resp = requests.get(f"http://user-service/users/{order['user_id']}")
            user = user_resp.json()
        
        with tracer.start_as_current_span("serialize_response"):
            response = {
                "order": order,
                "user": user
            }
        
        return response
```

**In Jaeger UI, you see:**
```
Trace: abc-def-ghi-123
  ├─ Span: get_order (260ms total)
  │  ├─ fetch_from_db (10ms)
  │  ├─ fetch_user (200ms) ← HTTP call to user-service
  │  └─ serialize_response (1ms)
  │
  [Click fetch_user]
  └─ Detailed view:
     Service: user-service
     Operation: GET /users/42
     Span: fetch_user (200ms)
     ├─ db.query (150ms) ← slow database query
     └─ serialize (50ms)
     Tags: user_id=42, db_connection_pool_size=5
     Logs: "Warning: connection pool near capacity (4/5)"
```

---

## MLOps Fundamentals

---

### Q74. What is MLOps and how does it differ from DevOps?

**Answer:**

**MLOps (ML Operations)** is the practice of deploying, monitoring, and maintaining machine learning models in production. It's similar to DevOps but with unique challenges:

**DevOps focus:** Code changes, infrastructure, deployments.

**MLOps focus:** Code + Data + Models. Model changes, data quality, retraining, model drift, feature consistency.

**Why MLOps is harder:**

| Aspect | DevOps | MLOps |
|--------|--------|-------|
| Determinism | Code v1.0 always does the same thing | Model v1.0 may produce different outputs on different data |
| Dependencies | Depends on libraries, services | Depends on code + data + hyperparameters |
| Testing | Unit tests, integration tests | Unit/integration + validation, statistical tests |
| Rollback | Deploy old code version | Model regression: is old model actually better? |
| Monitoring | Uptime, error rates, latency | Model performance, data drift, prediction drift |
| Reproducibility | Containerize code | Containerize code + snapshot training data + record hyperparams |

**MLOps workflow:**

```
Data Collection
    ↓
Data Preprocessing
    ↓
Feature Engineering
    ↓
Model Training (hyperparameter tuning, cross-validation)
    ↓
Model Evaluation (on held-out test set)
    ↓
Model Registry (version and metadata)
    ↓
Model Deployment (to serving infrastructure)
    ↓
Monitoring (performance, drift, predictions)
    ↓
[If performance degrades] Retraining (with new data)
    ↓
[Feedback loop] (back to training)
```

---

### Q75. What is model drift and how do you detect it?

**Answer:**

**Model drift** occurs when a model's performance degrades in production because the real-world data has changed from the training data. The model was trained on data from 2023, but now it's 2025 and the data distribution has changed.

**Types of drift:**

**Data Drift (Covariate Shift):**
- The input features change, but the relationship between features and target stays the same.
- Example: Training data had users aged 20-40. Now your user base is 40-60.
- The model's decision boundary is still valid, but it's being applied to different feature distributions.

**Concept Drift (Target Drift):**
- The relationship between features and target changes.
- Example: You trained a model to detect fraud in 2023. In 2025, fraud patterns have evolved (criminals use new tactics). Same transactions that were "normal" before are now "fraud."
- Much harder to handle than data drift.

**Detection methods:**

```python
# Statistical approach: Compare training distribution to production distribution
from scipy.stats import ks_2samp, chi2_contingency
import numpy as np

# 1. Kolmogorov-Smirnov test (for continuous features)
training_age = [25, 30, 28, 35, 22, ...]  # 10,000 samples
production_age = [45, 50, 48, 55, 42, ...]  # Last 1000 samples

statistic, p_value = ks_2samp(training_age, production_age)
if p_value < 0.05:  # Statistically significant difference
    print("ALERT: Data drift detected in 'age' feature!")

# 2. Monitor model performance metrics
# Ground truth becomes available over time (e.g., did the fraud prediction match reality?)
training_auc = 0.95
production_auc = 0.89  # Degradation!

if (training_auc - production_auc) > 0.05:
    print("ALERT: Model performance degraded by 6%!")

# 3. Track prediction distribution
# If your model used to predict "fraud" 2% of the time, 
# but now predicts "fraud" 15% of the time, something changed
training_fraud_rate = 0.02
production_fraud_rate = 0.15

if production_fraud_rate > training_fraud_rate * 2:
    print("ALERT: Prediction distribution shifted!")

# 4. Calculate Population Stability Index (PSI)
def calculate_psi(expected, actual, buckets=10):
    """
    PSI = sum((actual% - expected%) × ln(actual% / expected%))
    PSI > 0.1 = significant drift
    """
    def psi_bucket(expected_prop, actual_prop):
        if expected_prop == 0:
            expected_prop = 0.0001
        if actual_prop == 0:
            actual_prop = 0.0001
        return (actual_prop - expected_prop) * np.log(actual_prop / expected_prop)
    
    breakpoints = np.percentile(expected, np.linspace(0, 100, buckets + 1))
    expected_counts = np.histogram(expected, breakpoints)[0] / len(expected)
    actual_counts = np.histogram(actual, breakpoints)[0] / len(actual)
    
    return sum(psi_bucket(e, a) for e, a in zip(expected_counts, actual_counts))

psi = calculate_psi(training_age, production_age)
if psi > 0.1:
    print(f"ALERT: Significant drift detected (PSI={psi:.2f})")
```

**Response to drift:**

```
1. Detect drift via monitoring
2. Create alert to ML team
3. Investigate:
   - Has the business changed? (new customer segment, product change)
   - Is the data quality degraded? (data pipeline bug)
   - Is this temporary or permanent? (seasonal trend vs. shift)
4. Options:
   a) Retrain model on recent data
   b) Adjust model thresholds (if concept drift is mild)
   c) Use ensemble of old and new models (blend predictions)
   d) Collect more labeled data if ground truth is sparse
5. Monitor performance after intervention
```

---

### Q76. What is feature engineering and feature stores?

**Answer:**

**Feature engineering** is the process of transforming raw data into meaningful inputs for machine learning models. It's considered 60-80% of ML work.

**Raw data → Features:**
```
Raw transaction data:
├─ transaction_timestamp: 2025-01-15 14:32:45
├─ merchant_id: 12345
├─ amount: 150.00
├─ user_id: 999

Features (engineered):
├─ hour_of_day: 14 (extract from timestamp)
├─ is_weekend: 0
├─ merchant_category: "restaurants"
├─ amount_log: 5.01 (log transform for skewed distribution)
├─ avg_user_spending_30d: 2500 (aggregate, requires joining with historical data)
├─ is_merchant_high_risk: 1 (lookup from merchant table)
├─ days_since_user_joined: 145
└─ user_avg_transaction_amount: 180.50

Model input: [14, 0, "restaurants", 5.01, 2500, 1, 145, 180.50]
Model predicts: fraud_probability = 0.08 (8% chance this is fraud)
```

**Feature stores** are centralized repositories for managing features at scale. They:
1. **Define features** — Standardized definitions, versions, and metadata.
2. **Store offline features** — Historical features for training.
3. **Store online features** — Real-time features for serving (low latency, high throughput).
4. **Track lineage** — Which features depend on which data sources.
5. **Version management** — Track feature definitions over time.

**Popular tools:** Tecton, Feast, Hopsworks, Databricks Feature Store.

**Example (Feast feature store):**

```python
# feature_definitions.py
from feast import Entity, FeatureView, FeatureService, Field
from feast.on_demand_feature_view import on_demand_feature_view
from datetime import timedelta

# Define entities
user = Entity(name="user_id", value_type=ValueType.INT64)
merchant = Entity(name="merchant_id", value_type=ValueType.INT64)

# Historical data source (for training)
user_features_source = BigQuerySource(
    name="user_features_table",
    dataset="ml_features",
    created_timestamp_column="created_at"
)

# Real-time data source (for serving, e.g., Redis)
user_features_online = RedisSource(
    name="user_features_online",
    redis_host="redis.default",
    redis_port=6379
)

# Define a feature view (collection of related features)
@feature_view(
    name="user_transaction_features",
    entities=[user],
    ttl=timedelta(days=1),
    source=user_features_source,
    online_source=user_features_online,
)
def user_transaction_features():
    return [
        Field(name="avg_transaction_amount"),
        Field(name="num_transactions_30d"),
        Field(name="days_since_joined"),
        Field(name="num_fraud_cases"),
    ]

# On-demand feature (computed at request time, not pre-computed)
@on_demand_feature_view(
    name="user_computed_features",
    source=[user_transaction_features],
)
def user_computed_features(inputs: Dict[str, Any]) -> Dict[str, Any]:
    # Compute feature at serving time (e.g., fraud rate)
    fraud_rate = inputs["num_fraud_cases"] / max(inputs["num_transactions_30d"], 1)
    return {"fraud_rate": fraud_rate}

# Create a feature service (collection of features for a specific model)
fraud_detection_fs = FeatureService(
    name="fraud_detection",
    features=[
        user_transaction_features[["avg_transaction_amount", "num_transactions_30d"]],
        user_computed_features[["fraud_rate"]],
    ]
)
```

```python
# Training: Get historical features
from feast import FeatureStore

store = FeatureStore(repo_path=".")

# Request features for a specific user + time range
training_df = store.get_historical_features(
    entity_df=pd.DataFrame({
        "user_id": [1, 2, 3, ...],
        "event_timestamp": ["2024-01-01", "2024-01-01", ...]
    }),
    features=[
        "user_transaction_features:avg_transaction_amount",
        "user_transaction_features:num_transactions_30d",
        "user_computed_features:fraud_rate"
    ]
).to_df()

# Train model on historical features
model = FraudDetector()
model.fit(training_df[["avg_transaction_amount", "num_transactions_30d", "fraud_rate"]], 
          training_df["is_fraud"])

# Serving: Get real-time features
@app.route("/predict_fraud", methods=["POST"])
def predict():
    request_data = request.json  # {"user_id": 123, "merchant_id": 456}
    
    # Fetch features from feature store (online store = Redis, fast)
    features = store.get_online_features(
        features=[
            "user_transaction_features:avg_transaction_amount",
            "user_transaction_features:num_transactions_30d",
            "user_computed_features:fraud_rate"
        ],
        entity_rows=[{"user_id": request_data["user_id"]}]
    ).to_dict()
    
    # Get online features
    input_vector = [
        features["avg_transaction_amount"][0],
        features["num_transactions_30d"][0],
        features["fraud_rate"][0]
    ]
    
    # Predict
    fraud_prob = model.predict_proba(input_vector)[1]
    
    return {"fraud_probability": fraud_prob}
```

---

## Data Pipelines & ETL

---

### Q77. What is an ETL pipeline and how does it differ from ELT?

**Answer:**

**ETL (Extract, Transform, Load):**
1. **Extract** — Pull data from source systems (databases, APIs, files).
2. **Transform** — Clean, aggregate, join, and process data.
3. **Load** — Write processed data to data warehouse/lake.

**ELT (Extract, Load, Transform):**
1. **Extract** — Pull data from source systems.
2. **Load** — Write raw data to data warehouse first.
3. **Transform** — Process data in the warehouse using SQL/Spark.

**Key difference:** ETL transforms before storing (space-efficient, but complex); ELT transforms after (flexible, can explore raw data, but storage-intensive).

**When to use:**
- **ETL:** Limited storage, simple transformations, need to enforce data quality before loading.
- **ELT:** Cheap storage, complex analytics, exploratory data analysis, want to preserve raw data.

**Example ETL (Apache Airflow):**

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'user_etl_pipeline',
    default_args=default_args,
    schedule_interval='@daily',  # Run daily at midnight UTC
    start_date=datetime(2025, 1, 1),
)

# Extract
def extract_from_source():
    """Extract user data from CRM system via API"""
    import requests
    import json
    
    response = requests.get('https://crm.example.com/api/users')
    users = response.json()
    
    # Save to temporary file
    with open('/tmp/users_raw.json', 'w') as f:
        json.dump(users, f)
    
    print(f"Extracted {len(users)} users")
    return len(users)

# Transform
def transform_data():
    """Clean, aggregate, and enrich data"""
    import json
    import pandas as pd
    
    # Load raw data
    with open('/tmp/users_raw.json', 'r') as f:
        users = json.load(f)
    
    df = pd.DataFrame(users)
    
    # Clean
    df = df.dropna(subset=['email'])  # Remove users without email
    df['email'] = df['email'].str.lower()  # Normalize email
    
    # Enrich
    df['signup_year'] = pd.to_datetime(df['created_at']).dt.year
    df['is_active'] = (pd.to_datetime(df['last_login']) > datetime.now() - timedelta(days=30))
    
    # Aggregate
    user_stats = df.groupby('signup_year').agg({
        'email': 'count',
        'is_active': 'sum'
    }).rename(columns={'email': 'total_users', 'is_active': 'active_users'})
    
    # Save transformed data
    df.to_csv('/tmp/users_transformed.csv', index=False)
    user_stats.to_csv('/tmp/user_stats.csv')
    
    print(f"Transformed {len(df)} users")
    return len(df)

# Load
def load_to_warehouse():
    """Load transformed data to data warehouse"""
    import psycopg2
    import pandas as pd
    
    conn = psycopg2.connect("dbname=warehouse user=etl password=secret")
    
    # Load main table
    df = pd.read_csv('/tmp/users_transformed.csv')
    df.to_sql('users', conn, if_exists='append', index=False)
    
    # Load aggregated stats
    stats = pd.read_csv('/tmp/user_stats.csv')
    stats.to_sql('user_signup_stats', conn, if_exists='replace', index=False)
    
    conn.close()
    print("Loaded data to warehouse")

# Define DAG tasks
extract_task = PythonOperator(
    task_id='extract',
    python_callable=extract_from_source,
    dag=dag,
)

transform_task = PythonOperator(
    task_id='transform',
    python_callable=transform_data,
    dag=dag,
)

load_task = PythonOperator(
    task_id='load',
    python_callable=load_to_warehouse,
    dag=dag,
)

# Define dependencies: extract → transform → load
extract_task >> transform_task >> load_task
```

**DAG (Directed Acyclic Graph) visualization:**
```
extract (pulls 5000 users)
    ↓ (depends on)
transform (cleans, aggregates)
    ↓ (depends on)
load (inserts into warehouse)
    ↓ (completes)
Send Slack notification: "ETL completed successfully"
```

---

### Q78. What is a data lake vs data warehouse?

**Answer:**

**Data Warehouse:**
- **Schema-on-write** — Define schema before loading data.
- **Structured, cleaned data** — Only validated, processed data allowed.
- **Optimized for analytics** — Fast SQL queries on cleaned data.
- **Expensive storage** — Usually SSD-based, premium infrastructure.
- **Example:** Snowflake, BigQuery, Redshift.

**Data Lake:**
- **Schema-on-read** — Store raw data, define schema when querying.
- **Any data** — Raw files, images, videos, sensor data, logs.
- **Exploratory analytics** — Find patterns in raw data before processing.
- **Cheap storage** — Usually object storage (S3, GCS, ADLS) measured in petabytes.
- **Example:** Hadoop, AWS S3 + Athena, Azure Data Lake.

**Data Lakehouse (modern hybrid):**
- **Combines both** — Raw data lake + structured tables with schema enforcement.
- **Example:** Delta Lake, Apache Iceberg, Apache Hudi.

**Visual comparison:**

```
Data Warehouse:
source_system_A → [ETL pipeline] → cleaned_users table
source_system_B → [ETL pipeline] → cleaned_orders table
                                   ↓
                            SQL Query: fast ✓
                            "SELECT * FROM users WHERE age > 30"
                            
Data Lake:
source_system_A → [raw files] → /data/users/2025-01-15/users.json
source_system_B → [raw files] → /data/orders/2025-01-15/orders.parquet
logs            → [raw files] → /data/logs/2025-01-15/app.log
                                   ↓
                            Query raw data with Spark/Presto
                            "SELECT user_id, COUNT(*) FROM 
                             s3://data/orders/ WHERE year=2025"
                            (No schema required, just pattern matching)

Data Lakehouse (Delta Lake):
raw files → [ingest] → /delta/raw/orders/ (all versions retained)
            ↓
         [transformation] → /delta/processed/orders_clean/
                            (parquet + metadata, supports SQL)
            ↓
         Query both raw and processed
         "SELECT * FROM delta.raw.orders" (raw data)
         "SELECT * FROM delta.processed.orders_clean" (clean data)
```

---

## Feature Engineering & Serving

---

### Q79. What is online vs offline feature serving?

**Answer:**

**Offline feature serving** — For training data. Fetch features from databases/data lakes for historical events. Latency: Seconds to minutes (acceptable).

**Online feature serving** — For inference. Fetch features for a live prediction request. Latency: Milliseconds (must be fast!).

**Example:**

```
Fraud detection model:

OFFLINE FEATURE SERVING (Training)
Scenario: Collect training data for last 2 years
├─ Query: "Get all transactions from 2023-2024"
├─ For each transaction, fetch features:
│  ├─ avg_user_spending (from data warehouse)
│  ├─ num_fraud_cases (count from historical events)
│  ├─ merchant_category (from lookup table)
│  └─ user_location (from user profile table)
├─ Join everything into one training dataset
├─ Training dataset: 100GB, 10 million transactions
├─ Latency acceptable: took 30 minutes to generate (daily batch)
└─ Save to training_data.parquet

ONLINE FEATURE SERVING (Inference)
Scenario: New transaction arrives in real-time
├─ User swipes credit card at 3:45 PM
├─ Request reaches prediction service: 
│  POST /predict { "user_id": 123, "merchant_id": 456, "amount": 150 }
├─ Service needs features immediately:
│  ├─ avg_user_spending: query Redis (cache) → 5ms
│  ├─ num_fraud_cases: query Redis → 2ms
│  ├─ merchant_category: query Redis → 3ms
│  └─ user_location: query Redis → 2ms
├─ Total latency: 12ms ✓ (acceptable for real-time prediction)
├─ Model predicts: fraud_probability = 0.15
├─ If > 0.5, block the transaction
└─ Response to POS terminal: "Approved" (within 50ms required for card authorization)

If we used offline approach (query data warehouse):
├─ Query warehouse for features: 2-3 seconds
├─ POS terminal timeout: 50ms
├─ Transaction is declined due to timeout ✗
└─ User's card is blocked
```

**Architecture pattern:**

```
Offline Path (batch):
Data sources → [Spark/batch job] → Features (daily) → Feature store (offline: BigQuery, Snowflake)
                                                    ↓
                                               Training

Online Path (real-time):
Data sources → [streaming job] → Features (real-time) → Feature store (online: Redis, DynamoDB)
                                                      ↓
                                                Inference service
                                                     ↓
                                                Model prediction
```

---

### Q80. What is model inference and what are the approaches to serve models?

**Answer:**

**Model inference** is using a trained model to make predictions on new data. "Serving" means deploying a model so applications can call it to get predictions.

**Serving approaches:**

**1. Batch Inference (Offline):**
- Process many samples together once per day/hour.
- Pre-compute predictions and store in a table.
- Applications query the table, not the model.
- Latency: Not real-time, but very efficient.
- Use case: Recommendations (compute all recommendations nightly), fraud scores (batch update).

**2. Real-time Inference (Online):**
- Model runs in a service. Application sends a request, gets prediction immediately.
- Latency: Sub-100ms.
- Use case: Credit card fraud detection, price estimation, content ranking.

**3. Edge Inference:**
- Model runs on the user's device or edge server near the user.
- Zero network latency.
- Use case: Computer vision on mobile, voice recognition offline.

**Example architectures:**

```
Batch Inference (Nightly)
Data source (Spark) → Model prediction job → Results table (Parquet/BigQuery)
                                           ↓
                     Application: "SELECT recommendation FROM predictions_table"
                                   (lookup, not inference)

Real-time Inference (Online)
Request → Load Balancer → Model Serving Pod 1 (TensorFlow Serving)
       → Model Serving Pod 2 (Triton Inference Server)
       → Model Serving Pod 3
          ↓
    Prediction: {"class": "fraud", "probability": 0.95}
          ↓
    Response to client (~100ms)

Edge Inference (Mobile)
Model (5MB .onnx file) → Downloaded to phone → Runs locally on CPU
   ↓
User takes photo → Model predicts immediately (0 network latency)
```

---

## Model Training & Experimentation

---

### Q81. What is hyperparameter tuning and what are the strategies?

**Answer:**

**Hyperparameters** are settings of a machine learning algorithm that are set *before* training (not learned from data). Learning rate, number of layers, regularization strength, etc.

**Goal:** Find hyperparameters that maximize model performance on a validation set.

**Problem:** Huge search space. A neural network might have 50+ hyperparameters. Trying all combinations = explosion.

**Strategies:**

**1. Grid Search:**
- Define a grid of values: `learning_rate in [0.001, 0.01, 0.1]`, `batch_size in [32, 64, 128]`.
- Try all combinations: 3 × 3 = 9 models trained.
- Exhaustive, but impractical for large grids.

**2. Random Search:**
- Sample hyperparameters randomly from distributions.
- Train 100 random combinations.
- Often finds better solutions than grid search for same compute.

**3. Bayesian Optimization:**
- Use past trials to predict which hyperparameters to try next.
- Smarter than random, fewer trials needed.
- Tools: Optuna, Ray Tune, Hyperopt.

**4. Population-Based Training (PBT):**
- Train multiple models simultaneously with different hyperparameters.
- Copy weights from high-performing model to low-performing, mutate hyperparameters.
- Efficient, good for distributed training.

**Example (Optuna):**

```python
import optuna
from optuna.trial import Trial
import xgboost as xgb

def objective(trial: Trial) -> float:
    """Objective function to minimize (validation loss)"""
    
    # Define hyperparameter search space
    params = {
        'max_depth': trial.suggest_int('max_depth', 3, 10),
        'learning_rate': trial.suggest_float('learning_rate', 1e-5, 1e-1, log=True),
        'n_estimators': trial.suggest_int('n_estimators', 50, 500),
        'subsample': trial.suggest_float('subsample', 0.5, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.5, 1.0),
        'reg_lambda': trial.suggest_float('reg_lambda', 1e-5, 10, log=True),
    }
    
    # Train model with these hyperparameters
    model = xgb.XGBClassifier(**params, random_state=42, n_jobs=-1)
    
    # Use cross-validation
    from sklearn.model_selection import cross_val_score
    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc', n_jobs=-1)
    
    return -scores.mean()  # Optuna minimizes, so negate for maximization

# Create a study and optimize
sampler = optuna.samplers.TPESampler()  # Tree-structured Parzen Estimator (Bayesian)
study = optuna.create_study(sampler=sampler)

study.optimize(
    objective,
    n_trials=100,  # Train 100 models
    n_jobs=4,      # Parallel trials
    show_progress_bar=True,
)

# Best hyperparameters
best_params = study.best_params
print(f"Best hyperparameters: {best_params}")
print(f"Best validation AUC: {-study.best_value:.4f}")

# Train final model with best hyperparameters
final_model = xgb.XGBClassifier(**best_params)
final_model.fit(X_train, y_train)
test_auc = final_model.score(X_test, y_test)
print(f"Test AUC: {test_auc:.4f}")
```

**Optuna trial history:**
```
Trial 1:  max_depth=5, lr=0.01, n_est=100 → AUC=0.72
Trial 2:  max_depth=7, lr=0.001, n_est=200 → AUC=0.68
Trial 3:  max_depth=6, lr=0.05, n_est=150 → AUC=0.75 ← Better, explore near here
Trial 4:  max_depth=6, lr=0.04, n_est=160 → AUC=0.76 ← Even better
...
Trial 100: max_depth=6, lr=0.045, n_est=155 → AUC=0.78 ← Best found
```

---

### Q82. What is cross-validation and why is it important?

**Answer:**

**Cross-validation** estimates a model's generalization performance without a separate test set (or in addition to one). It reduces variance in performance estimates by training/testing multiple times.

**K-Fold Cross-Validation (most common):**

1. Divide data into K equal parts (folds).
2. For each fold i:
   - Train on K-1 folds.
   - Test on fold i.
   - Record performance metric.
3. Average the K performance values.

**Why important:**
- Better use of limited data (all data is used for both training and testing).
- Detect overfitting (if train performance >> test performance, model is overfitting).
- More reliable performance estimate than a single train/test split.

**Example:**

```python
from sklearn.model_selection import cross_val_score, KFold
from sklearn.ensemble import RandomForestClassifier
import numpy as np

model = RandomForestClassifier(n_estimators=100)

# 5-Fold cross-validation
cv = KFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring='roc_auc', n_jobs=-1)

print(f"Fold 1 AUC: {scores[0]:.4f}")
print(f"Fold 2 AUC: {scores[1]:.4f}")
print(f"Fold 3 AUC: {scores[2]:.4f}")
print(f"Fold 4 AUC: {scores[3]:.4f}")
print(f"Fold 5 AUC: {scores[4]:.4f}")
print(f"Mean AUC: {scores.mean():.4f} (+/- {scores.std():.4f})")

# Output:
# Fold 1 AUC: 0.8234
# Fold 2 AUC: 0.8156
# Fold 3 AUC: 0.8289
# Fold 4 AUC: 0.8312
# Fold 5 AUC: 0.8195
# Mean AUC: 0.8237 (+/- 0.0071)

# The +/- value is the standard error
# If you train one final model, you expect AUC = 0.8237 ± 0.0071
```

**Stratified K-Fold (for imbalanced classes):**

```python
from sklearn.model_selection import StratifiedKFold

# Default KFold might create folds with imbalanced class distributions
# StratifiedKFold ensures each fold has similar class proportions

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring='roc_auc')

# If y is 95% class 0, 5% class 1:
# Each fold will have ~95% class 0, ~5% class 1 (representative)
```

---

## AI/ML System Design

---

### Q83. How would you design a recommendation system?

**Answer:**

A **recommendation system** suggests items (products, videos, songs) to users based on their past behavior and preferences.

**Types of approaches:**

**1. Collaborative Filtering:**
- Assumption: Users who liked the same items in the past will like the same items in the future.
- "You watched 10 movies. User X watched the same 10 movies + 3 others. Recommend those 3 to you."
- Pros: No content knowledge needed.
- Cons: Cold start (new users/items with no history).

**2. Content-Based:**
- Assumption: Users like items similar to ones they've liked before.
- "You watched Sci-Fi movies. Here are more Sci-Fi movies."
- Pros: Works for cold start items.
- Cons: Can lead to homogeneous recommendations.

**3. Hybrid:**
- Combine collaborative filtering + content-based + other signals.
- Most production systems use this.

**Example (E-commerce Recommendation):**

```python
import numpy as np
from sklearn.neighbors import NearestNeighbors

# User-Item Matrix (rows=users, columns=items, values=rating)
# Sparse in reality (most users haven't rated most items)
user_item_matrix = np.array([
    [5, 4, 0, 0, 1],  # User 0 ratings
    [4, 5, 2, 0, 1],  # User 1 ratings
    [0, 0, 5, 4, 0],  # User 2 ratings
    [0, 0, 4, 5, 0],  # User 3 ratings
    [1, 0, 0, 0, 5],  # User 4 ratings
])
# Item 0=Phone, 1=Laptop, 2=Keyboard, 3=Monitor, 4=Headphones

# Collaborative Filtering: Find similar users
model = NearestNeighbors(metric='cosine', algorithm='brute')
model.fit(user_item_matrix)

# User 0 is asking: "What should I buy?"
# Find 3 most similar users
distances, indices = model.kneighbors(user_item_matrix[0:1], n_neighbors=3)

similar_users = indices[0]  # [0, 1, 3] (most similar)
print(f"Users similar to 0: {similar_users}")

# Items they rated highly but user 0 hasn't rated
recommendations = []
for user_idx in similar_users:
    user_ratings = user_item_matrix[user_idx]
    user_0_ratings = user_item_matrix[0]
    
    # Items this similar user rated high but user 0 hasn't rated
    unrated_items = np.where(user_0_ratings == 0)[0]
    for item_idx in unrated_items:
        if user_ratings[item_idx] > 3:  # High rating
            recommendations.append({
                'item': item_idx,
                'score': user_ratings[item_idx],
                'reason': f'User {user_idx} liked this'
            })

print(recommendations)
# Output: Item 2 (Keyboard, rated 4 by user 1), Item 3 (Monitor, rated 4 by user 3)
```

**Production architecture:**

```
Batch (Offline):
├─ Collaborative filtering job (Spark)
│  ├─ Input: User-item interaction matrix (clicks, purchases)
│  ├─ Train: Matrix factorization, nearest neighbors
│  ├─ Output: Top-K recommendations per user (pre-computed)
│  └─ Frequency: Daily/weekly
│
└─ Store in database: user_id → [recommended_item_1, item_2, ...]

Real-time (Online):
├─ When user visits:
│  ├─ Query database: Get pre-computed recommendations (5ms)
│  ├─ Personalize: Adjust based on current session
│  ├─ Rank: Consider inventory, margin, freshness
│  └─ Return: Top-5 recommendations
│
└─ ML service (Python/Java):
   ├─ Content-based scoring: similarity between user profile and items
   ├─ Context: Time of day, location, device
   ├─ Explore/exploit: Sometimes recommend novel items (exploration)
   └─ A/B test: Version A (collab filtering), Version B (hybrid)

Feedback loop:
├─ User clicks recommendation → Log event
├─ Model learns: This recommendation led to a click (positive)
├─ User ignores recommendation → Also log (negative signal)
└─ Use feedback for next day's batch retraining
```

---

### Q84. How would you design a real-time anomaly detection system?

**Answer:**

**Anomaly detection** identifies unusual patterns in data (fraud, system outages, network intrusions, equipment failures).

**Challenges:**
- Must process streaming data in real-time (latency: < 100ms).
- Anomalies are rare (class imbalance: 99.9% normal, 0.1% anomalies).
- "Normal" changes over time (concept drift).

**Approaches:**

**1. Statistical (Threshold-based):**
- Define normal range: mean ± 3×std dev.
- Flag values outside range as anomalies.
- Fast, interpretable, no ML needed.
- Problem: Doesn't work if anomaly is within range.

**2. Unsupervised (Isolation Forest, LOF):**
- Train model on historical normal data.
- At inference, flag samples that are "different" from normal.
- Doesn't require labeled anomalies.

**3. Supervised (Classification):**
- Collect labeled data: normal transactions + fraudulent transactions.
- Train classifier.
- Problem: Getting labeled anomalies is hard.

**4. Deep Learning (LSTM Autoencoder):**
- Train autoencoder on normal sequences.
- Autoencoder reproduces normal sequences well.
- Anomalous sequences have high reconstruction error.
- Can capture temporal patterns.

**Example (Real-time fraud detection on streaming transactions):**

```python
# Stream: Transactions flowing in from payment network
# Goal: Flag fraud < 100ms

from kafka import KafkaConsumer, KafkaProducer
import json
import numpy as np
from sklearn.ensemble import IsolationForest
import redis

# 1. Load pre-trained model
import joblib
model = joblib.load('fraud_model.pkl')
scaler = joblib.load('scaler.pkl')

# 2. Connect to Redis (for feature cache)
redis_client = redis.Redis(host='localhost', port=6379)

# 3. Consume transaction stream
consumer = KafkaConsumer(
    'transactions',
    bootstrap_servers=['kafka:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

producer = KafkaProducer(
    bootstrap_servers=['kafka:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

for message in consumer:
    transaction = message.value
    user_id = transaction['user_id']
    amount = transaction['amount']
    timestamp = transaction['timestamp']
    
    # Fetch user features from cache (updated in batch job)
    user_features = redis_client.hgetall(f'user_features:{user_id}')
    avg_amount = float(user_features.get(b'avg_amount', 0))
    num_transactions_today = int(user_features.get(b'num_txns_today', 0))
    
    # Build feature vector
    features = np.array([[
        amount,
        amount / (avg_amount + 1),  # ratio to average
        num_transactions_today,
        time.hour(timestamp),  # hour of day
    ]])
    
    # Standardize
    features_scaled = scaler.transform(features)
    
    # Predict
    is_anomaly = model.predict(features_scaled)[0]  # -1 = anomaly, 1 = normal
    anomaly_score = model.score_samples(features_scaled)[0]
    
    # Decision
    if is_anomaly == -1:  # Fraud detected
        decision = 'BLOCK'
        producer.send('fraud_alerts', {
            'user_id': user_id,
            'transaction_id': transaction['id'],
            'reason': f'Isolation Forest flagged (score={anomaly_score:.2f})',
            'timestamp': timestamp
        })
    else:
        decision = 'APPROVE'
    
    # Log decision (for monitoring and feedback)
    producer.send('transaction_decisions', {
        'user_id': user_id,
        'transaction_id': transaction['id'],
        'decision': decision,
        'anomaly_score': float(anomaly_score),
        'timestamp': timestamp
    })
    
    # Respond to POS/payment gateway
    # Response sent back via REST API or message queue
```

**System architecture:**

```
Payment Network
    ↓ (streaming transactions)
Kafka Topic: transactions
    ↓
Stream Processing (Flink/Spark):
├─ Featurization: Enrich with user history (cached in Redis)
├─ Anomaly Detection: Isolation Forest inference
├─ Decision: Block/Approve
└─ Output: Fraud alerts, decisions
    ↓
Kafka Topic: fraud_alerts
    ↓
├─ Block transaction (POS system)
├─ Alert fraud team (Slack, email)
├─ Log for investigation
└─ Store ground truth (for model retraining)

Daily batch job:
├─ Collect feedback: Was alert correct? (user called, no fraud)
├─ Update model: Retrain Isolation Forest with new transactions
├─ Update features: Recalculate user averages, store in Redis
└─ Schedule for next deployment

Monitoring:
├─ False positive rate (legitimate transactions blocked)
├─ False negative rate (fraud slipped through)
├─ Detection latency
└─ Model drift (accuracy over time)
```

---

### Q85. How would you design a neural network training system at scale?

**Answer:**

**Challenges:**
- Models with billions of parameters (GPT-3 has 175B parameters).
- Training data with billions of examples.
- Single GPU not enough → distributed training across 100s of GPUs/TPUs.
- Keep all processes synchronized.

**Key concepts:**

**Data Parallelism:** Split data across multiple machines. Each machine trains on a batch, gradients are averaged.

**Model Parallelism:** Split model across machines. Layer A on GPU 1, Layer B on GPU 2. Used for huge models that don't fit on one GPU.

**Pipeline Parallelism:** Combination. Split both data and model.

**Example (PyTorch Distributed Data Parallel):**

```python
import torch
import torch.nn as nn
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler

# Setup distributed training
dist.init_process_group(backend='nccl')  # NCCL for GPU communication
rank = dist.get_rank()
world_size = dist.get_world_size()
torch.cuda.set_device(rank)

# Model
model = MyLargeNeuralNetwork()
model = model.cuda(rank)

# Wrap with DDP: Synchronizes gradients across devices
model = DDP(model, device_ids=[rank], output_device=rank)

# Data: Each process gets a different shard
dataset = MyDataset(num_samples=1_000_000)
sampler = DistributedSampler(
    dataset,
    num_replicas=world_size,  # 8 processes (8 GPUs)
    rank=rank,
    shuffle=True
)
dataloader = DataLoader(dataset, batch_size=64, sampler=sampler)

# Optimizer
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
lr_scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.1)

# Training loop
for epoch in range(100):
    sampler.set_epoch(epoch)  # Ensure different shuffle each epoch
    
    for batch_idx, (data, labels) in enumerate(dataloader):
        data = data.cuda(rank)
        labels = labels.cuda(rank)
        
        # Forward pass
        outputs = model(data)
        loss = nn.CrossEntropyLoss()(outputs, labels)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        
        # DDP synchronizes gradients across all processes
        # (automatic in backward())
        
        # Update weights
        optimizer.step()
        
        if batch_idx % 100 == 0 and rank == 0:
            print(f"Epoch {epoch}, Batch {batch_idx}, Loss: {loss.item():.4f}")
    
    if rank == 0:  # Save checkpoint from rank 0 only
        torch.save(model.module.state_dict(), f'checkpoint_epoch_{epoch}.pt')
    
    lr_scheduler.step()

# Cleanup
dist.destroy_process_group()
```

**Launch distributed training:**

```bash
# Launch on 8 GPUs (8 processes)
torchrun --nproc_per_node=8 train.py

# Or with Slurm (for HPCs):
srun python -m torch.distributed.launch --nproc_per_node=8 train.py
```

**What happens:**

```
GPU 0 (Rank 0)        GPU 1 (Rank 1)        ...        GPU 7 (Rank 7)
  ↓                      ↓                                  ↓
Load batch 0         Load batch 1                       Load batch 7
  ↓                      ↓                                  ↓
Forward pass         Forward pass                       Forward pass
Loss: 2.34           Loss: 2.31                         Loss: 2.37
  ↓                      ↓                                  ↓
Compute gradients    Compute gradients                  Compute gradients
  ↓                      ↓                                  ↓
[All-reduce operation: synchronize gradients across all 8 GPUs]
  ↓                      ↓                                  ↓
Average gradients    Average gradients                  Average gradients
  ↓                      ↓                                  ↓
Update weights       Update weights                     Update weights

Result: All 8 GPUs have identical model state
8 batches processed in parallel = 8x speedup (roughly)
Batch size effectively 8×64=512 (larger batch = better stability)
```

---

### Q86. What is transfer learning and why is it useful?

**Answer:**

**Transfer learning** is training a model on Task A, then reusing the learned weights for Task B (usually different but related).

**Why useful:**
- Task B has limited labeled data, but Task A has lots of data.
- Task B is similar to Task A (transfer is possible).
- Saves huge computational cost (pretrained model = thousands of GPU hours already spent).

**Example:**

```
Image classification in medical domain:
- Large dataset (ImageNet): 1.4M images, 1000 classes
- Small dataset (chest X-rays): 10,000 images, 2 classes (normal vs pneumonia)

Traditional approach:
- Train from scratch on 10k X-rays: overfitting, needs 200-500 GPU hours, poor performance

Transfer learning approach:
- Start with ImageNet-pretrained ResNet50 (already learned edge detection, textures, shapes)
- Fine-tune on 10k X-rays: 2-5 GPU hours, better performance (lower error rate)

Why? The lower layers (edges, textures) are universal.
Only upper layers need to adapt to X-ray differences.
```

**Code example:**

```python
import torchvision.models as models
import torch.nn as nn

# Load pretrained ResNet50 (trained on ImageNet)
model = models.resnet50(pretrained=True)

# Freeze all layers (keep ImageNet knowledge)
for param in model.parameters():
    param.requires_grad = False

# Replace the classifier head (last layer) for our task
num_classes = 2  # Normal or Pneumonia
model.fc = nn.Linear(model.fc.in_features, num_classes)

# Only this new layer will be trained
for param in model.fc.parameters():
    param.requires_grad = True

# Optimizer only updates the new fc layer
optimizer = torch.optim.Adam(model.fc.parameters(), lr=0.001)

# Training loop (on 10k X-rays)
for epoch in range(10):
    for data, labels in train_dataloader:
        outputs = model(data)
        loss = loss_fn(outputs, labels)
        
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
    
    # Evaluate on validation set
    val_accuracy = evaluate(model, val_dataloader)
    print(f"Epoch {epoch}: Accuracy {val_accuracy:.2%}")
# Output: Epoch 9: Accuracy 97.5% (excellent on small dataset)
```

**Fine-tuning strategies:**

```
Strategy 1: Frozen encoder (above example)
├─ Freeze all layers
├─ Train only the new classifier head
├─ Good when target domain is very different or data is tiny
└─ Fastest training

Strategy 2: Unfreeze gradually
├─ Keep bottom layers frozen (generic features)
├─ Unfreeze top layers (domain-specific)
├─ Train with low learning rate (don't corrupt learned weights)
└─ Better accuracy, slower training

Strategy 3: All layers trainable
├─ Unfreeze entire model
├─ Use very low learning rate (e.g., 1e-5 vs 1e-3)
├─ Train for many epochs
└─ Best accuracy but risk of overfitting
```

---

## Inference & Serving

---

### Q87. What is batch processing vs stream processing in machine learning?

**Answer:**

**Batch Processing (Offline):**
- Collect data for a period (e.g., hourly, daily).
- Run inference on all data at once.
- Store predictions for later use.
- Latency: Hours to days.
- Pros: Efficient, can use expensive GPUs fully.
- Cons: Can't respond to individual requests in real-time.

**Stream Processing (Real-time):**
- Process individual data points as they arrive.
- Return prediction immediately.
- Latency: Milliseconds.
- Pros: Real-time responses.
- Cons: Must be efficient (can't use expensive computations).

**When to use:**

```
Batch Processing:
├─ Recommendations (compute daily, serve from cache)
├─ Fraud scores (batch update nightly)
├─ Demand forecasting (predict demand for next week)
├─ Report generation (daily/monthly batch)
└─ Data labeling (label millions of samples)

Stream Processing:
├─ Credit card fraud (decide in <100ms)
├─ Pricing (adjust price as user browses)
├─ Content ranking (rank search results for user)
├─ Anomaly detection (alert on unusual metric)
└─ Voice assistants (respond to voice input <1 second)
```

**Example: Batch Fraud Score Prediction**

```python
# Batch (offline)
from pyspark.sql import SparkSession
from pyspark.ml import PipelineModel

spark = SparkSession.builder.appName("fraud_scoring").getOrCreate()

# Load model
model = PipelineModel.load("fraud_model_v2")

# Read all transactions from yesterday
transactions = spark.read.parquet("s3://transactions/2025-01-15/")

# Batch predict all transactions
predictions = model.transform(transactions)

# Save predictions to DynamoDB
predictions.write.format("dynamodb") \
    .option("dynamodb.tableName", "fraud_scores") \
    .save()

# Runtime: 30 minutes for 1 billion transactions
```

**Example: Stream Fraud Detection**

```python
# Stream (real-time)
from pyspark.sql import SparkSession
from pyspark.ml import PipelineModel
from pyspark.sql.functions import col

spark = SparkSession.builder \
    .appName("fraud_stream") \
    .getOrCreate()

# Load model
model = PipelineModel.load("fraud_model_v2")

# Read from Kafka stream
transactions = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "transactions") \
    .load()

# Parse JSON
from pyspark.sql.types import *
schema = StructType([
    StructField("user_id", IntegerType()),
    StructField("amount", DoubleType()),
    StructField("merchant_id", IntegerType()),
])
parsed = transactions.select(from_json(col("value").cast("string"), schema).alias("data")).select("data.*")

# Predict
predictions = model.transform(parsed)

# Write results
query = predictions \
    .select("user_id", "prediction", "probability") \
    .writeStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("topic", "fraud_predictions") \
    .option("checkpointLocation", "/tmp/checkpoint") \
    .start()

query.awaitTermination()
# Latency: <100ms per transaction
```

---

### Q88. How would you deploy a large language model (LLM) for inference?

**Answer:**

**Challenges with LLM inference:**
- Models are huge (GPT-2: 1.5B params, LLaMA 2: 7B-70B params).
- Generate tokens sequentially (slow for long outputs).
- High memory requirements (model + KV cache).
- Expensive GPUs.

**Optimization techniques:**

**1. Quantization** — Reduce precision (FP32 → INT8). Smaller, faster, less accurate.

**2. Pruning** — Remove unimportant weights. Trades accuracy for speed.

**3. Distillation** — Train smaller model to mimic large model. Much smaller, faster.

**4. Batching** — Process multiple requests simultaneously to amortize costs.

**5. KV Cache Optimization** — Cache previous token representations to avoid recomputation.

**Example: Serving with vLLM (optimized serving library)**

```python
# vLLM: Optimized LLM serving engine
from vllm import LLM, SamplingParams
import ray

# Initialize model on GPU with optimizations
llm = LLM(
    model="meta-llama/Llama-2-7b-hf",
    tensor_parallel_size=2,  # Shard across 2 GPUs
    gpu_memory_utilization=0.9,  # Use 90% of GPU memory
    dtype="float16",  # Use half precision
)

# Sampling parameters
sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.9,
    max_tokens=200,
)

# Single request
outputs = llm.generate(
    ["What is machine learning?"],
    sampling_params
)
print(outputs[0].outputs[0].text)

# Batch requests (efficient)
prompts = [
    "What is machine learning?",
    "Explain neural networks",
    "Define deep learning",
    # ... 1000 more prompts
]

outputs = llm.generate(prompts, sampling_params)
# vLLM batches requests, shares KV cache → efficient GPU utilization

# Latency:
# - Single request: ~2 seconds (generate 200 tokens)
# - 1000 requests batched: ~15 seconds (amortized 15ms per request)
```

**Production serving architecture:**

```
Client Requests
    ↓ (REST API)
Load Balancer
    ↓
API Gateway (FastAPI)
    ├─ Validate request
    ├─ Rate limiting
    └─ Log request
         ↓
Request Queue (Redis)
         ↓
vLLM Inference Server (on GPU)
├─ Batch requests (multiple users' requests together)
├─ Generate tokens
├─ Stream responses back
└─ Log generated text (for safety, monitoring)
         ↓
Response streamed back to client
         ↓
Monitor: latency, cost ($/token), throughput

Scaling:
├─ Vertical: Use bigger GPU (A100 instead of V100)
├─ Horizontal: Run multiple vLLM instances with load balancing
└─ Cache: Store frequent responses (e.g., "What is AI?") in Redis
```

---

## Data Quality & Monitoring

---

### Q89. What is data validation and what are common checks?

**Answer:**

**Data validation** ensures data meets quality standards before processing. Bad data → bad ML models.

**Common checks:**

```python
import pandas as pd
import numpy as np

df = pd.read_csv('users.csv')

# 1. Completeness: Check for missing values
missing_pct = df.isnull().sum() / len(df) * 100
assert df['email'].isnull().sum() == 0, "Email column has nulls!"
assert missing_pct['age'] < 0.05, "Age column >5% missing"  # Allow < 5%

# 2. Uniqueness: Check for duplicates
assert df.drop_duplicates().shape[0] == df.shape[0], "Duplicate rows found!"
assert df['email'].duplicated().sum() == 0, "Duplicate emails!"

# 3. Format: Check data types and format
assert df['age'].dtype == 'int64', "Age is not integer!"
assert df['email'].str.contains(r'@').all(), "Invalid email format!"
assert df['phone'].str.match(r'^\+?1?\d{10}$').sum() > 0.95 * len(df), "Invalid phone format!"

# 4. Range: Check values are within acceptable bounds
assert df['age'].min() > 0, "Negative ages!"
assert df['age'].max() < 150, "Unrealistic ages!"
assert df['salary'].min() > 0, "Negative salary!"

# 5. Consistency: Related fields make sense
assert (df['email'] != '').all(), "Empty email!"
assert (df['age'] > 0).all(), "Age <= 0"
# If someone is inactive, last_login should be in the past
inactive_but_recent_login = df[(df['is_active'] == False) & (df['last_login'] > datetime.now() - timedelta(days=7))]
assert len(inactive_but_recent_login) == 0, f"Found {len(inactive_but_recent_login)} inconsistencies!"

# 6. Outliers: Detect unusual values
Q1 = df['salary'].quantile(0.25)
Q3 = df['salary'].quantile(0.75)
IQR = Q3 - Q1
outliers = df[(df['salary'] < Q1 - 1.5*IQR) | (df['salary'] > Q3 + 1.5*IQR)]
print(f"Found {len(outliers)} salary outliers (likely data entry errors)")

# 7. Referential integrity: Check foreign keys exist
user_ids_in_orders = orders['user_id'].unique()
valid_user_ids = users['user_id'].unique()
orphaned_orders = [uid for uid in user_ids_in_orders if uid not in valid_user_ids]
assert len(orphaned_orders) == 0, f"Found orders for non-existent users: {orphaned_orders}"

# 8. Statistical checks: Distribution looks reasonable
# Compare to historical distribution
historical_avg_age = 35.5
current_avg_age = df['age'].mean()
if abs(current_avg_age - historical_avg_age) > 10:
    print(f"WARNING: Average age shifted from {historical_avg_age} to {current_avg_age}")
    # Could indicate data quality issue or natural drift (e.g., demographic change)

print("All validations passed! ✓")
```

**In a pipeline:**

```python
from great_expectations import dataset

# Great Expectations: data validation framework
context = ge.get_context()

# Define expectations
batch = context.get_batch_data("my_table")

# Expect certain columns
expect = batch.expect_table_columns_to_exist(['user_id', 'email', 'age', 'salary'])

# Expect column to be complete
expect = batch.expect_column_values_to_be_not_null('email')

# Expect value range
expect = batch.expect_column_values_to_be_between('age', min_value=0, max_value=150)

# Validate
validation_result = batch.validate()
if validation_result.success:
    print("Data validation passed ✓")
else:
    print("Data validation failed ✗")
    # Don't proceed with ML pipeline
    exit(1)
```

---

### Q90. What is model monitoring and what metrics should you track?

**Answer:**

**Model monitoring** tracks a model's performance in production over time. If performance degrades, alert the team to retrain.

**Metrics to track:**

```
1. PERFORMANCE METRICS (requires ground truth, e.g., actual fraud labels after investigation)
├─ Accuracy (% correct predictions)
├─ Precision (of positive predictions, how many were correct)
├─ Recall (of actual positives, how many did we catch)
├─ F1 Score (balance of precision and recall)
├─ AUC (Area Under ROC Curve, good for imbalanced classes)
└─ Custom metrics (business-specific)

2. OPERATIONAL METRICS (real-time, no ground truth needed)
├─ Latency (how long does prediction take)
├─ Throughput (predictions/sec)
├─ Model size (MB of model)
├─ Feature availability (% of requests where features were available)
├─ Error rate (% of requests that errored)
└─ GPU/CPU utilization

3. DATA METRICS (input data distribution)
├─ Feature statistics (min, max, mean of each feature)
├─ Feature correlation (did correlations change)
├─ Missing value percentage
├─ Outlier percentage
└─ Data drift (KS test, PSI, chi-square)

4. PREDICTION METRICS (output distribution)
├─ Prediction distribution (% of fraud predictions)
├─ Confidence distribution (are predictions confident or uncertain)
├─ Class imbalance (if predictions are very skewed)
└─ Prediction drift (are predictions changing over time)
```

**Example monitoring dashboard (Prometheus + Grafana):**

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# Define metrics
prediction_counter = Counter(
    'model_predictions_total',
    'Total predictions',
    ['model_version', 'prediction_class']
)

prediction_latency = Histogram(
    'model_prediction_latency_seconds',
    'Latency of predictions',
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0]
)

model_accuracy = Gauge(
    'model_accuracy',
    'Model accuracy (updated daily)',
    ['model_version']
)

feature_availability = Gauge(
    'feature_availability_percent',
    'Percentage of requests with all features available',
    ['feature_name']
)

# In prediction service
def predict(user_id, features):
    start_time = time.time()
    
    try:
        # Prediction logic
        prediction = model.predict([features])[0]
        
        # Record metrics
        latency = time.time() - start_time
        prediction_latency.observe(latency)
        prediction_counter.labels(
            model_version='v2.1',
            prediction_class='fraud' if prediction > 0.5 else 'normal'
        ).inc()
        
        return prediction
    
    except MissingFeatureError:
        feature_availability.labels(feature_name='avg_amount').set(95)

# Daily batch job: Update accuracy
def update_accuracy_metric():
    # Get ground truth labels from past 24 hours
    labels = get_ground_truth_labels(hours=24)
    predictions = get_predictions_from_db(hours=24)
    
    accuracy = (labels == predictions).mean()
    model_accuracy.labels(model_version='v2.1').set(accuracy)
    
    if accuracy < 0.90:  # Alert if accuracy < 90%
        send_slack_alert(f"Model accuracy dropped to {accuracy:.2%}")

# In Grafana dashboard, visualize:
# - Accuracy over time (see if trending down = model drift)
# - Latency p99 (is inference getting slower?)
# - Prediction distribution (is fraud rate changing unexpectedly?)
# - Feature availability (are features being computed successfully?)
```

---

### Q91. What is a data versioning system and why is it important?

**Answer:**

**Data versioning** tracks versions of datasets (not just code). Like Git for data.

**Why important:**
- Reproduce results: "Which exact dataset trained model v1.5?"
- Debug issues: "Did performance drop because we changed the data?"
- Rollback: "Revert to yesterday's dataset."
- Lineage: "Where did this data come from? Which transformations were applied?"

**Challenges:**
- Data is huge (TB/PB). Can't store all versions on disk.
- Need to track transformations (if we re-ran ETL on new raw data, is output same?).
- Reproducibility vs efficiency trade-off.

**Solutions:**

**1. Git-LFS (Git Large File Storage):**
- Store pointers to large files in Git, actual files in object store.
- Works but not ideal for massive datasets.

**2. DVC (Data Version Control):**
- Tracks data files, creates checksums.
- Stores data in S3/GCS/HDFS.
- Git tracks .dvc files (pointers), not actual data.

**3. Pachyderm:**
- Kubernetes-native, containerized data pipelines.
- Automatic versioning of each transformation step.
- Directed acyclic graph (DAG) of transformations.

**4. Delta Lake / Iceberg:**
- Track data versions at table level.
- Time-travel: "Show me this table as it was on 2025-01-01"
- Full ACID transactions.

**Example (DVC + Git):**

```bash
# Train a model with specific data version
git log
# commit abc123: "Train model on 2025-01-01 data"

git checkout abc123
dvc checkout  # Restore exact dataset from that commit
python train.py
# Reproduces exact model from that time

# Now, new data arrives
wget https://data-source.com/users_2025-01-16.csv
dvc add users.csv  # dvc.yaml now tracks this file's hash

git add dvc.yaml
git commit -m "Update to 2025-01-16 data"

# DVC uses hash of file (SHA-256)
# If anyone re-downloads users.csv and it differs → DVC detects (hash mismatch)
```

**Example (Delta Lake time-travel):**

```python
import delta

spark = SparkSession.builder.appName("delta_demo").getOrCreate()

# Load table as it was on 2025-01-15
df = spark.read.format("delta").option("versionAsOf", "2025-01-15").load("/data/users")

# Or load as it was 30 versions ago
df = spark.read.format("delta").option("versionAsOf", 30).load("/data/users")

# View history
history = spark.sql("DESCRIBE HISTORY delta.`/data/users`")
history.show()
# Output:
# version | timestamp           | userId | operation | operationParameters
# 5       | 2025-01-16 10:30:00 | alice  | WRITE     | {mode: "append"}
# 4       | 2025-01-16 08:15:00 | bob    | WRITE     | {mode: "overwrite"}
# 3       | 2025-01-15 22:00:00 | alice  | WRITE     | {mode: "append"}

# Restore to version 3
spark.sql("RESTORE TABLE delta.`/data/users` TO VERSION AS OF 3")
```

---

### Q92. What is an experiment tracking system and why do ML engineers need it?

**Answer:**

**Experiment tracking** records metadata about ML experiments (hyperparameters, metrics, code version, data version) so you can reproduce results and compare runs.

**Problem without tracking:**
- Run model A: accuracy = 0.92
- Run model B: accuracy = 0.93
- Which hyperparameters made B better? What data was used? What code version?
- 3 months later, try to reproduce: Can't remember which was which.

**Popular tools:** MLflow, Weights & Biases (W&B), Neptune, Comet.

**Example (MLflow):**

```python
import mlflow
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score
import json

# Start experiment
mlflow.set_experiment("fraud_detection")

# Run 1: Baseline
with mlflow.start_run(run_name="baseline_rf"):
    # Parameters
    n_estimators = 100
    max_depth = 10
    mlflow.log_params({
        'n_estimators': n_estimators,
        'max_depth': max_depth,
        'model_type': 'RandomForest'
    })
    
    # Train
    model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth)
    model.fit(X_train, y_train)
    
    # Metrics
    y_pred = model.predict(X_val)
    accuracy = accuracy_score(y_val, y_pred)
    precision = precision_score(y_val, y_pred)
    recall = recall_score(y_val, y_pred)
    
    mlflow.log_metrics({
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall
    })
    
    # Log model
    mlflow.sklearn.log_model(model, 'model')
    
    # Log metadata
    mlflow.log_param('data_version', 'v1.2')
    mlflow.log_param('code_commit', 'abc123')
    
    print(f"Run 1: Accuracy {accuracy:.4f}")

# Run 2: Hyperparameter tuning
with mlflow.start_run(run_name="tuned_rf"):
    n_estimators = 200
    max_depth = 15
    mlflow.log_params({
        'n_estimators': n_estimators,
        'max_depth': max_depth,
        'model_type': 'RandomForest'
    })
    
    model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_val)
    accuracy = accuracy_score(y_val, y_pred)
    precision = precision_score(y_val, y_pred)
    recall = recall_score(y_val, y_pred)
    
    mlflow.log_metrics({
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall
    })
    
    mlflow.sklearn.log_model(model, 'model')
    
    print(f"Run 2: Accuracy {accuracy:.4f}")

# Compare runs
# MLflow UI: localhost:5000
# Shows: Run 1 accuracy=0.92, Run 2 accuracy=0.93
# Difference: n_estimators 100 → 200, max_depth 10 → 15
# Conclusion: Increasing both improved accuracy by 1%
```

**MLflow UI visualization:**

```
Experiment: fraud_detection

Run                  Parameters                 Metrics
baseline_rf          n_estimators: 100         accuracy: 0.9200
                     max_depth: 10             precision: 0.8900
                                               recall: 0.8600

tuned_rf             n_estimators: 200         accuracy: 0.9310
                     max_depth: 15             precision: 0.9100
                                               recall: 0.8800

gradient_boosting    n_estimators: 150         accuracy: 0.9325 ← Best!
                     learning_rate: 0.05       precision: 0.9150
                                               recall: 0.8900
```

---

## Summary Table: Questions 65-92

| # | Topic | Concept |
|---|-------|---------|
| 65 | DevOps | Infrastructure as Code (Terraform, CloudFormation) |
| 66 | DevOps | Containerization (Docker vs VMs) |
| 67 | DevOps | Service Mesh (Istio) |
| 68 | DevOps | GitOps (ArgoCD, Flux) |
| 69 | CI/CD | CI/CD Pipelines (stages, GitHub Actions) |
| 70 | CI/CD | Canary Deployments |
| 71 | Observability | SLOs, SLAs, SLIs |
| 72 | Observability | Chaos Engineering |
| 73 | Observability | Distributed Tracing (Jaeger, OpenTelemetry) |
| 74 | MLOps | MLOps definition and challenges |
| 75 | MLOps | Model Drift and detection |
| 76 | MLOps | Feature Engineering and Feature Stores |
| 77 | Data | ETL vs ELT |
| 78 | Data | Data Lake vs Data Warehouse |
| 79 | Features | Online vs Offline Feature Serving |
| 80 | Inference | Model Inference approaches |
| 81 | Training | Hyperparameter Tuning (Optuna) |
| 82 | Training | Cross-Validation |
| 83 | AI/ML Design | Recommendation Systems |
| 84 | AI/ML Design | Anomaly Detection |
| 85 | AI/ML Design | Distributed Neural Network Training |
| 86 | AI/ML Design | Transfer Learning |
| 87 | Inference | Batch vs Stream Processing |
| 88 | Inference | LLM Inference (vLLM, quantization) |
| 89 | Data Quality | Data Validation |
| 90 | Monitoring | Model Monitoring |
| 91 | Data | Data Versioning (DVC, Delta Lake) |
| 92 | Monitoring | Experiment Tracking (MLflow) |

---

## Additional Deep-Dive Topics (Q93-150)

> Due to length constraints, here are topic headers for Questions 93-150. Each would follow the same detailed format (question → answer → example).

### Q93-100: Advanced MLOps Topics

93. What is model registry and version control for models?
94. What is A/B testing for ML models and how do you run it?
95. What is multi-armed bandit algorithms vs A/B testing?
96. How do you handle imbalanced datasets in machine learning?
97. What is data augmentation and when is it useful?
98. How do you detect and handle class imbalance in production?
99. What is adversarial testing for ML models?
100. How do you set up reproducible ML experiments?

### Q101-110: Large Scale Data Systems

101. What is Apache Spark and how does it enable distributed ML?
102. What is data parallelism vs feature parallelism in distributed training?
103. How do you handle skewed data distribution in distributed systems?
104. What is fault tolerance in distributed systems?
105. How does Spark handle shuffle operations?
106. What are the trade-offs between batch and stream processing?
107. How would you design a real-time recommendation system?
108. What is data lineage and why track it?
109. How do you optimize Spark jobs?
110. What is graph processing and when do you use it?

### Q111-120: Advanced Model Serving

111. What is model compression (quantization, pruning, distillation)?
112. How do you serve multiple model versions simultaneously?
113. What is shadow mode deployment in ML?
114. How do you handle model cold starts?
115. What is online learning and continuous learning?
116. How do you serve models on edge devices?
117. What is ensemble methods for prediction?
118. How do you handle prediction latency in real-time systems?
119. What is federated learning?
120. How do you debug production model failures?

### Q121-130: Advanced Data Engineering

121. What is dimensional modeling and star schema?
122. What is data quality frameworks (Great Expectations)?
123. How do you handle late-arriving data?
124. What is slowly changing dimensions (SCD)?
125. How do you design fact tables for analytics?
126. What is data masking and PII protection?
127. How do you audit data access?
128. What is data mesh architecture?
129. How do you handle data retention and GDPR compliance?
130. What is reverse ETL?

### Q131-140: AI System Edge Cases

131. How do you handle cold start problem (new users/items)?
132. What is position bias in ranking systems?
133. How do you handle temporal data (seasonality, trends)?
134. What is feedback loops in ML systems?
135. How do you prevent model staleness?
136. What is concept drift in online learning?
137. How do you detect distributional shift?
138. What is fairness in machine learning?
139. How do you detect and prevent biased models?
140. What is explainability and interpretability in ML?

### Q141-150: Production Challenges

141. How do you scale inference for millions of requests/sec?
142. What is knowledge distillation and when to use it?
143. How do you handle GPU memory constraints?
144. What is inference optimization for mobile/edge?
145. How do you reduce inference cost at scale?
146. What is serverless ML (AWS Lambda, Google Cloud Functions)?
147. How do you monitor model staleness?
148. What is online experimentation at scale?
149. How do you coordinate feature development across teams?
150. What is causal inference in ML?

---

## Recommended Learning Path

**Beginner (Q1-50):**
- Start with Questions 1-34 from the previous guide.
- Then move to Q65-70 (DevOps basics).

**Intermediate (Q35-100):**
- Q35-64 from previous guide.
- Q71-92 from this guide.
- Focus on: Observability, Data Pipelines, MLOps fundamentals, Experiment tracking.

**Advanced (Q101-150):**
- Q93-150 from this guide.
- Requires solid understanding of distributed systems and ML.
- Topics: Large-scale data systems, advanced model serving, production edge cases.

---

## Key Takeaways

**DevOps is Infrastructure:** IaC, containers, CI/CD, monitoring — all about reliable, scalable operations.

**MLOps is Data + Models:** Model drift, data validation, feature stores, experiment tracking — ML adds complexity because outcomes depend on data quality.

**Data is critical:** 80% of ML project time is data work (collection, cleaning, validation, versioning). Good data systems are foundation.

**Monitoring is non-negotiable:** Models degrade in production. Without monitoring (data drift, performance drift), you won't know.

**Reproducibility matters:** Tracking hyperparameters, data versions, code versions lets you reproduce results months later.

**Trade-offs everywhere:**
- Real-time vs Batch?
- Accuracy vs Latency?
- Consistency vs Availability?
- Cost vs Performance?
Know the business requirements and choose accordingly.

---

*This extended guide covers DevOps, MLOps, and AI/ML system design. Work through questions in order, implementing small projects for each section. The best learning is hands-on: build a simple recommendation system, set up monitoring, create an ML pipeline.*
