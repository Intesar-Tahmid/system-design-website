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

### Q244. What is configuration management and how does it differ from Infrastructure as Code?

**Answer:**

**Infrastructure as Code (IaC)** provisions resources — it creates the server, network, and database. Tools: Terraform, CloudFormation, Pulumi.

**Configuration management** configures software on already-running servers — installs packages, sets config files, manages services. Tools: Ansible, Chef, Puppet, SaltStack.

```
IaC:               "Create a VM with 8GB RAM on AWS"
Config management: "On that VM, install Python 3.11, configure nginx, deploy our app"
```

**Modern convergence:** With containers and immutable infrastructure, configuration management has become less necessary. Instead of configuring servers in-place, you bake the configuration into a Docker image at build time and redeploy. But config management is still widely used for bare-metal servers, legacy environments, and cases where you need to manage the OS itself.

**Ansible (most common today):**
```yaml
- name: Install and start nginx
  hosts: webservers
  tasks:
    - apt: name=nginx state=present
    - service: name=nginx state=started enabled=yes
```

Ansible is agentless (uses SSH), making it lower operational overhead than Chef or Puppet.

---

### Q245. What is immutable infrastructure and why does it improve reliability?

**Answer:**

**Immutable infrastructure** means once a server is deployed, it is never modified. If you need a config change or software update, you build a new image and replace the old server — you never SSH in and change things.

**Traditional (mutable) approach:**
```
Deploy server → SSH in → install packages → edit configs → run app
→ Over time: "configuration drift" — servers that started identical slowly diverge
→ "Works on my server but not on prod" problem
```

**Immutable approach:**
```
Build Docker image (or AMI) → test it → deploy it → never touch it
→ If you need changes: build new image → deploy → terminate old
→ Every server is identical to the tested artifact
```

**Benefits:**
- **Reproducibility:** Same image everywhere — dev, staging, prod
- **Rollback:** Previous image is still available; redeploy instantly
- **No configuration drift:** Can't diverge if you never modify
- **Auditability:** Git history of Dockerfile shows every change

**This is why containers won:** Docker images are the canonical example of immutable infrastructure. The image is built once, tested once, and deployed identically everywhere.

---

### Q246. What is a VPC and how does network isolation work in the cloud?

**Answer:**

A **VPC (Virtual Private Cloud)** is your own isolated private network within a public cloud. You control IP ranges, subnets, routing tables, and firewall rules — isolated from other customers' networks.

**Subnets:**
- **Public subnet:** Has a route to an Internet Gateway. Resources here are reachable from the internet (load balancers, NAT gateways).
- **Private subnet:** No direct internet route. Resources here (databases, app servers) can only be accessed from within the VPC or via NAT for outbound connections.

```
Internet
    ↓
Internet Gateway
    ↓
Public Subnet: Load Balancer (10.0.1.0/24)
    ↓ (only internal traffic)
Private Subnet: App Servers (10.0.2.0/24)
    ↓ (only internal traffic)
Private Subnet: Databases (10.0.3.0/24)
```

**Security Groups:** Virtual firewalls attached to individual instances. "Allow port 5432 from 10.0.2.0/24 only" — database only accepts connections from the app subnet.

**VPC Peering:** Connect two VPCs so their private IP ranges can communicate — used to connect dev and prod VPCs, or connect to a partner's infrastructure.

---

### Q247. What is multi-cloud vs hybrid cloud strategy?

**Answer:**

**Multi-cloud:** Using services from multiple public cloud providers (AWS + GCP + Azure) simultaneously.
- ✅ Avoid vendor lock-in
- ✅ Use best-of-breed services (GCP for ML, AWS for everything else)
- ❌ Operational complexity — different APIs, tooling, certifications
- ❌ Data egress costs for moving data between clouds

**Hybrid cloud:** Mix of on-premises (your own datacenter) and public cloud.
- ✅ Sensitive data stays on-premises (compliance, regulations)
- ✅ Existing datacenter investment isn't wasted
- ❌ Requires private connectivity (VPN or Direct Connect) between on-prem and cloud
- ❌ More complex networking and security

**When each is relevant:**
- Regulated industries (healthcare, finance): hybrid cloud for data that can't leave premises
- Large enterprises: multi-cloud to avoid single-vendor dependency
- Most startups and modern companies: single cloud (simpler, cheaper, faster)

**Practical reality:** Many "multi-cloud" companies are simply on one main cloud (AWS) with one specific service on another (GCP's BigQuery for analytics). True workload portability across clouds is expensive to maintain.

---

### Q248. What is a service mesh and what does it actually do?

**Answer:**

A **service mesh** is an infrastructure layer that handles service-to-service communication in a microservices system. It adds capabilities like TLS, retries, circuit breaking, and observability to every service call — without changing any application code.

**How it works (sidecar proxy pattern):**
Every service gets a sidecar proxy (Envoy is the most common). All network traffic goes through the sidecar, not directly to the service.

```
Service A → Envoy sidecar A → [network] → Envoy sidecar B → Service B
                          ↑ handles TLS, retries, metrics, tracing
```

**What a service mesh gives you automatically:**
- **mTLS everywhere:** All service-to-service calls encrypted and authenticated
- **Retries and timeouts:** Configured centrally, not per-service
- **Circuit breaking:** Stop calling failing services
- **Distributed tracing:** Every hop tagged with the same trace ID
- **Traffic shaping:** Route 10% of requests to a canary version

**Popular service meshes:** Istio, Linkerd, Consul Connect.

**Cost:** Service meshes add latency (one extra network hop per sidecar), memory overhead (one proxy per pod), and significant operational complexity. Only worth it when managing dozens of services where the consistency of cross-cutting concerns matters.

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

### Q249. What is trunk-based development and why does it enable faster CI/CD?

**Answer:**

**Trunk-based development (TBD)** is a branching strategy where all developers commit directly to a single shared branch (the "trunk" or "main"). Feature branches are either avoided or kept very short-lived (< 1 day).

**Contrast with GitFlow:**
```
GitFlow:      feature/big-feature (lives 2 weeks) → merge conflicts hell → slow CI
Trunk-based:  main ← small commits multiple times/day → always releasable
```

**Why it enables fast CI/CD:**
- No long-lived branches = no big, painful merges
- Main branch is always in a deployable state
- CI runs on every commit to main — fast feedback
- Continuous deployment becomes practical

**But what about incomplete features?** Use **feature flags** to hide half-built features from users while the code is already in production.

```python
if feature_flags.enabled("new-checkout-flow", user_id):
    render_new_checkout()
else:
    render_old_checkout()
```

Code merges daily; feature launches when the flag is toggled — decoupling code deployment from feature release.

**Used by:** Google, Facebook, and most elite engineering organizations. The evidence strongly supports TBD + feature flags over long-lived branches.

---

### Q250. What is a rollback strategy and what are the different types?

**Answer:**

A **rollback** reverts a production system to a previous known-good state after a failed deployment or incident.

**Types:**

**Redeploy previous version:** Trigger the CI/CD pipeline to deploy the previous artifact. Simple, reliable, but takes the full deployment time (minutes).

**Canary rollback:** During a canary deployment, shift traffic back to the stable version. Near-instant if your load balancer can reroute in seconds.

**Feature flag rollback:** Toggle the feature flag off — the old code path activates instantly for all users. No deployment needed. Fastest option for features behind flags.

**Database rollback:** The hardest part. If the deployment ran migrations, rolling back the app doesn't undo schema changes. Strategies:
- Write migrations that are backward-compatible (additive only)
- Keep the old column during transition, remove in a later migration
- Maintain explicit "down" migrations

**Blue-green rollback:** Switch DNS/load balancer back to the "blue" environment still running the old version. Near-instant if using DNS, minutes if using health-check-based switching.

**Best practice:** Define your rollback plan *before* deploying. Know which type you're using. Set a maximum decision time (e.g., "if error rate > 5% after 10 minutes, rollback automatically").

---

### Q251. What is the difference between continuous delivery and continuous deployment?

**Answer:**

These terms are often used interchangeably but have a specific distinction:

**Continuous Integration (CI):** Every commit is automatically built and tested. Developers get fast feedback on whether their change broke anything.

**Continuous Delivery (CD):** Every commit that passes CI is packaged and is *ready* to be deployed to production. Deployment to production requires a human to click "deploy."

**Continuous Deployment:** Every commit that passes CI/CD is *automatically* deployed to production — no human approval needed.

```
CI:                  Code → Build → Test → ✅ "Artifact ready"
Continuous Delivery: Code → Build → Test → Artifact → [human approves] → Production
Continuous Deployment: Code → Build → Test → Artifact → Production (automated)
```

**Which to use:**
- Continuous deployment requires high test coverage and confidence (Google, Netflix use this)
- Continuous delivery is more common in regulated industries or where human review is required
- Pure CI-only is a stepping stone — you should aim for at least continuous delivery

**The business impact:** Facebook deploys thousands of times per day (continuous deployment). Every hour of manual gating is an hour of reduced velocity.

---

### Q252. What is a deployment pipeline for database schema changes?

**Answer:**

Deploying database schema changes safely requires more care than code changes — schemas can't always be instantly rolled back.

**Expand-contract pattern** (the safest approach for zero-downtime):

**Expanding migrations** are backward-compatible:
```sql
-- Safe: add a nullable column (old code ignores it)
ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);

-- Safe: add a new table
CREATE TABLE user_preferences (...);

-- Safe: add an index concurrently (doesn't lock table)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
```

**Contracting migrations** remove what's no longer needed:
```sql
-- Only safe after all code using the old column is deployed and stable
ALTER TABLE users DROP COLUMN old_column;
```

**Three-phase process:**
1. **Expand:** Add new column/table. Deploy. Old code ignores new column, new code can start using it.
2. **Migrate:** Backfill data if needed. Both old and new code work simultaneously.
3. **Contract:** Once old code is gone from all deployments, remove the old structure.

**Never do in one step:** Rename a column (breaks old code immediately), add NOT NULL without a default (breaks old code inserts), drop a column still used by deployed code.

---

### Q253. What is a feature branch workflow vs GitFlow and which scales better?

**Answer:**

**Feature branch workflow:** Developers create short-lived branches off main for each feature, then merge back via pull request.
- Simple, standard approach
- Works well for small-medium teams
- Risk: branches can grow long-lived, causing merge conflicts

**GitFlow:** A rigid branching model with specific branch types:
- `main`: production-ready code
- `develop`: integration branch
- `feature/*`: individual features (off develop)
- `release/*`: stabilization branch before production
- `hotfix/*`: emergency production fixes

```
GitFlow complexity:
feature → develop → release → main
hotfix  → main + develop
```

**Problems with GitFlow at scale:**
- Too many branches to track
- Long-lived branches lead to massive merge conflicts
- Slow — features sit in develop/release for weeks before reaching users
- Doesn't fit continuous deployment

**Trunk-based development scales better:** Companies like Google (30,000 engineers, one monorepo) use trunk-based development. GitFlow adds process that slows teams down without proportional benefit.

**Recommendation:** Feature branches for code review (1-2 day max lifespan) + trunk-based development with feature flags > GitFlow for teams doing CI/CD seriously.

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

### Q254. What is the difference between logs, metrics, and traces — and when do you use each?

**Answer:**

These are the "three pillars of observability." Each answers a different question.

**Logs:** Timestamped, structured records of individual events.
- "What happened?" — discrete events with context
- `{"ts": "2024-01-01T10:00:01Z", "level": "ERROR", "msg": "DB query failed", "query": "...", "user_id": 42}`
- Best for: debugging specific incidents, auditing, understanding event sequences

**Metrics:** Numeric measurements aggregated over time.
- "How much / how often?" — counts, gauges, histograms
- `api_request_duration_seconds{endpoint="/users"} p99=145ms`
- Best for: alerting, dashboards, capacity planning, trend analysis

**Traces:** A record of a request's journey through multiple services.
- "How did this specific request flow through the system?"
- Shows: service A called service B (50ms), which called DB (30ms)
- Best for: finding performance bottlenecks in distributed systems

**Combined example:**
```
Alert fires: p99 latency > 500ms (METRIC)
→ Look at traces for slow requests (TRACE)
→ Find that service B is slow — look at its logs (LOGS)
→ Logs show: "connection pool exhausted" events at same timestamps
→ Root cause found
```

**Tools:** Prometheus (metrics), Grafana (dashboards), Jaeger/Zipkin (traces), Elastic/Loki (logs), Datadog/Honeycomb (all-in-one).

---

### Q255. What is alerting fatigue and how do you reduce it?

**Answer:**

**Alerting fatigue** happens when an on-call engineer receives so many alerts (many false positives or low-importance) that they start ignoring them — including the critical ones.

**Symptoms:**
- Engineers silence alerts without investigating
- People feel stressed by notification volume
- A real incident gets missed because it's buried in noise

**Root causes:**
- Alerts on symptoms that don't require immediate action
- Static thresholds that don't account for normal variation
- Every error is an alert (instead of error rate)
- Alerts that don't have clear runbooks or owners

**Solutions:**

**1. Alert on symptoms, not causes:** Alert when users are affected — "error rate > 1%" not "CPU > 70%"

**2. Use percentiles and rates:** Alert on `p99 latency > 2s` not `any request > 2s`

**3. Tiered severity:**
```
P0: Page immediately (data loss, full outage)
P1: Page during business hours
P2: Create ticket for next sprint
```

**4. Alert ownership:** Every alert has an owner responsible for maintaining it. If an alert fires frequently without action → either fix it or delete it.

**5. Post-mortems for false positives:** Treat noisy alerts as bugs. Fix them.

---

### Q256. What is synthetic monitoring vs real user monitoring (RUM)?

**Answer:**

**Synthetic monitoring:** Automated scripts simulate user actions on a schedule — checking if your login page loads in under 2 seconds every 5 minutes from multiple regions.
- ✅ Proactive — detects issues before real users notice
- ✅ Consistent baseline — same test every time
- ✅ Works even at 3am when traffic is low
- ❌ Can't detect issues that only affect certain users, browsers, or network conditions

**Real User Monitoring (RUM):** JavaScript injected into your pages collects performance data from actual users' browsers as they use the site.
- ✅ Real-world data — captures actual user experience across all device types, network speeds, regions
- ✅ Catches bugs synthetic tests don't exercise
- ❌ No data when traffic is low (nights, weekends)
- ❌ Privacy considerations (sampling vs. full capture)

**Used together:**
```
Synthetic: "Our checkout page is up and loading in 1.2s" (proactive)
RUM:       "But 8% of users on mobile in Southeast Asia see 8s loads" (real-world gaps)
```

**Tools:** Datadog Synthetics, Pingdom (synthetic); Google Analytics, Datadog RUM, New Relic Browser (RUM).

---

### Q257. What is a runbook and how does it help incident response?

**Answer:**

A **runbook** is a documented set of procedures for handling a specific operational scenario — what to check, what commands to run, how to decide between options, and who to escalate to.

**Example runbook for "Database connection pool exhausted":**
```
1. Check current pool size: SELECT count(*) FROM pg_stat_activity;
2. Identify long-running queries: SELECT pid, now() - pg_stat_activity.query_start AS duration, query
   FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC;
3. If query > 5 minutes: SELECT pg_terminate_backend(pid) WHERE pid = <pid>;
4. Check app config: max_pool_size should be set to 20 per replica
5. If connections spike persists: scale app servers horizontally (reduces connections per server)
6. Escalate to: @database-team if not resolved in 30 minutes
```

**Why runbooks matter:**
- On-call engineer might be woken at 3am — runbook removes cognitive load
- Institutional knowledge captured — new engineers can handle incidents
- Consistent responses — everyone follows the same procedure
- Post-incident analysis — did the runbook work? Update it.

**Keep runbooks short and actionable.** They're not tutorials — they're emergency procedures. Include commands, expected outputs, and decision criteria.

---

### Q258. What is a service dependency graph and why do you need one?

**Answer:**

A **service dependency graph** maps which services call which other services. It answers "if Service X is down, what else breaks?"

**Example:**
```
API Gateway
    ├── User Service
    │     └── PostgreSQL
    ├── Order Service
    │     ├── PostgreSQL
    │     └── Payment Service (external)
    └── Notification Service
          ├── Email (SendGrid)
          └── SMS (Twilio)
```

**Why it matters:**

**Incident triage:** When the order service is down, the dependency graph tells you: check PostgreSQL and Payment Service first.

**Change risk assessment:** Deploying User Service — who depends on it? API Gateway. What's the blast radius if User Service is slow?

**SLA propagation:** If PostgreSQL has a 99.9% uptime SLA, and Order Service calls it, Order Service can't have a higher SLA than PostgreSQL.

**Building it:**
- **Manual:** Maintain a diagram in Confluence (gets outdated quickly)
- **Automatic via tracing:** Distributed tracing tools (Jaeger, Datadog APM) build dependency graphs automatically from actual traffic

**Recommended:** Build it automatically from distributed traces — it reflects reality, not documentation.

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

### Q259. What is the ML model lifecycle and what are its stages?

**Answer:**

The **ML model lifecycle** covers every phase from identifying a business problem to retiring an old model.

**Stages:**

**1. Problem definition:** Is ML the right tool? What metric defines success? What data do you have?

**2. Data collection and exploration:** Gather data, explore distributions, identify quality issues, understand label availability.

**3. Feature engineering:** Transform raw data into features the model can learn from. Often the most time-consuming stage.

**4. Model development:** Select algorithms, train, tune hyperparameters, evaluate offline metrics.

**5. Validation:** Offline evaluation (held-out test set, cross-validation) + behavioral testing (does the model behave correctly on edge cases?).

**6. Deployment:** Package model, set up serving infrastructure, canary or shadow deploy.

**7. Monitoring:** Track prediction quality (data drift, model drift, business metrics) in production.

**8. Retraining:** Scheduled or triggered retraining when model quality degrades.

**9. Retirement:** When model is replaced, ensure clean shutdown — don't leave serving infrastructure running.

**The loop:** Monitoring feeds back to problem definition — production data reveals new patterns that drive the next iteration.

---

### Q260. What is concept drift vs data drift?

**Answer:**

Both describe ways a deployed ML model can degrade over time, but at different levels.

**Data drift (covariate shift):** The distribution of input features changes. The model was trained on one population but now sees a different one.

```
Training data: User age distribution: 18-35 years old
Production (2 years later): App became popular with 50+ demographic
→ Model sees input distributions it's never encountered
→ Predictions become unreliable
```

**Concept drift:** The underlying relationship between features and the target label changes. Even if inputs stay the same, the "correct answer" has changed.

```
Training data (pre-COVID): "Home office furniture" → low purchase probability
Production (post-COVID): Same features → high purchase probability
→ The world changed; the model's learned rules no longer apply
```

**Detecting them:**
- Data drift: Monitor feature distribution statistics (mean, variance, PSI — Population Stability Index). Alert if distribution shifts significantly.
- Concept drift: Monitor actual business outcomes (precision, recall on labeled recent data, revenue impact of decisions).

**Responding:** Retrain on recent data. If the old training data is no longer representative, weight recent data more heavily or discard old data entirely.

---

### Q261. What is model reproducibility and why is it hard to achieve?

**Answer:**

**Reproducibility** means being able to run the same training code on the same data and get the same model (or at least the same performance metrics) every time.

**Why it matters:** If you can't reproduce a model, you can't debug it, audit it for compliance, or trust that your evaluation wasn't a fluke.

**Sources of non-reproducibility:**

**1. Randomness:** Model weight initialization, data shuffling, dropout, mini-batch sampling all use random numbers. Fix with `random.seed(42)`, `torch.manual_seed(42)`, `numpy.random.seed(42)` — and do it consistently everywhere.

**2. Floating-point non-determinism:** GPU operations (cuDNN) can produce different results due to parallel operation ordering. `torch.use_deterministic_algorithms(True)` enforces determinism at a performance cost.

**3. Data changes:** If training data is mutable (live database), the same pipeline run at different times uses different data. Fix: version datasets (DVC, Delta Lake time travel).

**4. Environment changes:** Different library versions → different behavior. Fix: pin all dependencies in `requirements.txt`, use Docker.

**5. Distributed training:** Non-deterministic gradient accumulation order across workers.

**Minimum viable reproducibility:** Version control code, lock dependencies, version datasets, log all hyperparameters in an experiment tracker.

---

### Q262. What is a model artifact and what should be stored alongside it?

**Answer:**

A **model artifact** is everything needed to load and use a trained model. At minimum, this is the serialized weights file (`.pkl`, `.pt`, `.onnx`). But a complete artifact includes much more.

**Complete model artifact should include:**

**1. Model weights** — the trained parameters (`model.pkl`, `model.pt`)

**2. Preprocessing pipeline** — the exact same scaler, encoder, tokenizer used at training time. Critical: if you scaled features with `StandardScaler` at training, you must use the *same* scaler (not a new one) at inference.

**3. Feature schema** — what features the model expects: column names, dtypes, expected ranges. Catches silent failures when upstream data changes.

**4. Model card / metadata:**
```json
{
  "model_name": "churn_predictor_v3",
  "trained_at": "2024-06-15",
  "training_data": "s3://bucket/data/users_2024Q1",
  "metrics": {"auc": 0.87, "precision": 0.82},
  "hyperparameters": {"n_estimators": 200, "max_depth": 6},
  "feature_importance": {...}
}
```

**5. Test predictions** — a small set of inputs with expected outputs for sanity-checking the loaded model.

**6. Training code version** — git commit hash that produced this artifact.

**Tools:** MLflow, DVC, SageMaker Model Registry — all handle artifact storage and metadata together.

---

### Q263. What is the difference between ML pipelines and traditional software pipelines?

**Answer:**

Both are automated sequences of steps, but ML pipelines have unique challenges:

**Traditional software pipeline (CI/CD):**
- Input: code
- Output: deployable artifact (Docker image)
- Deterministic: same code → same output
- Pass/fail is clear: tests either pass or fail

**ML training pipeline:**
- Input: code + data + hyperparameters
- Output: model artifact (weights + metadata)
- Non-deterministic: same code, different random seed → different model
- Quality is a spectrum: accuracy 87% vs 88% — which is "passing"?
- Data quality issues silently produce bad models (garbage in → garbage out)

**Additional complexities in ML pipelines:**

**Data validation step:** Must check that training data matches expected schema and statistics before training — a data pipeline bug can silently degrade model quality.

**Training step:** Can take hours or days. Must be restartable from checkpoints.

**Evaluation step:** Compares new model against current production model (champion-challenger). Promotes new model only if it's better on key metrics.

**Data versioning:** You need to know exactly which data version was used for each training run — impossible with traditional CI/CD tooling alone.

**Tools:** Kubeflow Pipelines, Apache Airflow + MLflow, Metaflow, Vertex AI Pipelines.

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

### Q264. What is Change Data Capture (CDC) and how is it used in data pipelines?

**Answer:**

**CDC** is a technique for detecting and capturing changes made to a database (inserts, updates, deletes) and streaming those changes in real time to downstream systems.

**How it works (log-based CDC):** Every database maintains a transaction log (WAL in Postgres, binlog in MySQL). CDC tools read this log and emit change events without any additional load on the database.

```
PostgreSQL WAL → Debezium (CDC tool) → Kafka → Data warehouse / Search index / Cache
```

**Why it's powerful for data pipelines:**
- Captures *all* changes, including deletes — traditional ETL struggles with deletes
- Real-time: changes appear in the data warehouse within seconds, not hours
- No polling queries on the source database
- Complete audit trail — you can replay history from the beginning

**Use cases:**
- Sync production database to analytics warehouse in real time
- Update search index (Elasticsearch) when products change
- Invalidate cache entries when source data changes
- Event sourcing — using DB changes as the event stream

**Tools:** Debezium (open source, Kafka-based), AWS DMS, Airbyte, Fivetran.

**Trade-off:** Requires access to the database's replication slot/log. Comes with operational overhead (slot management, replication lag monitoring).

---

### Q265. What is data pipeline idempotency and why is it critical?

**Answer:**

An **idempotent pipeline** produces the same result whether run once or multiple times. If a pipeline fails and is re-run, it doesn't duplicate data or produce incorrect results.

**Why pipelines fail:** Network timeouts, resource limits, hardware failures, upstream data arriving late. Pipelines *will* fail — the question is whether a retry is safe.

**Non-idempotent (dangerous):**
```python
# Append mode — re-running adds duplicates!
df.to_sql("daily_metrics", conn, if_exists="append")
```

**Idempotent (safe to retry):**
```python
# Upsert mode — re-running is safe
df.to_sql("daily_metrics", conn, if_exists="replace", 
          method="multi", chunksize=1000)
# Or: write to a temp table, then MERGE/UPSERT into target
```

**Techniques:**
- **Replace, don't append:** Overwrite the partition for the current date
- **Upsert (MERGE):** Insert if new, update if exists — based on a natural key
- **Idempotency key:** Include a unique run ID in each record; dedup on load
- **Date partitions:** Each pipeline run owns its date partition; re-running replaces only that partition

**Golden rule:** Every pipeline stage should be a pure function of its inputs — same input, same output, always.

---

### Q266. What is backfilling in data pipelines and what are the challenges?

**Answer:**

**Backfilling** is running a pipeline for historical dates after a change — either because the pipeline was newly created, a bug was fixed, or the business logic changed and historical data needs to be recomputed.

**Example:** You built a "daily active users" metric pipeline in March. Your CEO asks for the last 2 years of data. You need to backfill January 2022 to February 2024.

**Challenges:**

**1. Volume:** Running 2 years of daily data at once can overwhelm your compute or source database. Must throttle or batch.

**2. Source data availability:** Historical data might be in cold storage, have different schemas, or be partially missing.

**3. Idempotency:** If backfill fails halfway through month 6, re-running should not double-count months 1-5.

**4. Resource contention:** Backfill jobs competing with live production pipelines. Common solution: run backfills at reduced parallelism or off-hours.

**5. Correct "as-of" logic:** If your feature engineering uses today's prices to compute historical metrics, the backfill will be incorrect. Point-in-time correctness requires storing historical snapshots.

**Best practice:** Design pipelines with backfilling in mind from day one. Use date-partitioned tables, idempotent writes, and test your backfill logic before you need it in a crisis.

---

### Q267. What is a data pipeline orchestrator and what are the most popular ones?

**Answer:**

A **pipeline orchestrator** schedules, coordinates, and monitors the execution of data pipeline tasks. It defines dependencies (Task B runs after Task A succeeds), handles retries, sends alerts on failure, and provides a UI for monitoring.

**Core concepts:**
- **DAG (Directed Acyclic Graph):** Tasks as nodes, dependencies as edges. Tasks execute in dependency order, parallelizing where possible.
- **Task:** A unit of work (run a SQL query, trigger a Spark job, call an API)
- **Schedule:** Cron-like expression defining when the pipeline runs

**Popular orchestrators:**

| Tool | Best for |
|------|---------|
| Apache Airflow | General-purpose, massive ecosystem, Python-first |
| Prefect | Modern Python, better error handling, easier testing |
| Dagster | Data-aware (tracks assets not just tasks), great for ML |
| dbt | SQL transformations specifically |
| Luigi | Simpler, older, less common now |

**Airflow example:**
```python
with DAG("daily_etl", schedule_interval="0 6 * * *") as dag:
    extract = PythonOperator(task_id="extract", python_callable=extract_data)
    transform = PythonOperator(task_id="transform", python_callable=transform_data)
    load = PythonOperator(task_id="load", python_callable=load_data)
    
    extract >> transform >> load  # dependency chain
```

---

### Q268. What is stream processing vs batch processing for data pipelines?

**Answer:**

**Batch processing:** Data is collected over a period and processed all at once on a schedule (hourly, daily).
- Higher throughput per unit compute — processes large volumes efficiently
- Simple to reason about — deterministic, bounded input
- Latency is high — data is hours old by the time it's processed
- Tools: Spark, dbt, SQL queries

**Stream processing:** Data is processed continuously as it arrives, event by event or in micro-batches.
- Low latency — data is processed within seconds/milliseconds
- Handles unbounded data (infinite stream)
- More complex — must handle out-of-order events, late data, stateful operations
- Tools: Apache Flink, Kafka Streams, Spark Structured Streaming

**When to use each:**

| Use batch when | Use stream when |
|---------------|----------------|
| Daily reports, analytics | Fraud detection (real-time) |
| Large historical backfills | Live dashboards |
| Complex ML training pipelines | Real-time feature computation |
| Cost is a priority | Latency < 1 minute required |

**Hybrid (Lambda architecture):** Run both in parallel — batch for accurate historical, stream for low-latency recent. High operational complexity. Modern trend: use stream processing everywhere (Kappa architecture).

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

### Q269. What is feature drift and how do you monitor it in production?

**Answer:**

**Feature drift** is the gradual change in the statistical properties of input features over time. Since ML models learn patterns from training data, feature drift means the model is now receiving inputs that differ from what it was trained on — often silently degrading predictions.

**Detection approach — Population Stability Index (PSI):**
PSI quantifies how much a feature's distribution has shifted between training and production.

```
PSI < 0.1:    Stable — no action needed
0.1 < PSI < 0.2: Minor drift — monitor closely
PSI > 0.2:    Major drift — investigate and consider retraining
```

**Practical monitoring:**
```python
from evidently import ColumnDriftMetric
# Compare training distribution vs. last 7 days production data
report = Report(metrics=[ColumnDriftMetric(column_name="user_age")])
report.run(reference_data=training_df, current_data=production_df)
```

**What to monitor:** Null rates (null rate went from 0% to 5%?), value distributions (mean, percentiles), categorical cardinality (new categories appearing).

**Automated alerts:** Set up daily jobs that compute drift metrics and page on-call if PSI exceeds thresholds.

**Tools:** Evidently AI, WhyLogs, Great Expectations, Arize, Fiddler.

---

### Q270. What is point-in-time correctness in feature engineering?

**Answer:**

**Point-in-time (PIT) correctness** means that when training a model on historical data, you only use features that would have been *available at the time of the prediction* — not future information.

**The leakage problem:**
```
Training example: User clicked an ad at time T
Feature: "user's total purchases in the next 7 days" = 5 items

→ At prediction time T, this feature doesn't exist yet!
→ You've accidentally trained the model on future data
→ Model achieves 95% accuracy in training, 60% in production
→ This is called "data leakage"
```

**Point-in-time correct feature retrieval:**
```python
# For each training example at time T, retrieve features
# as they existed at time T, not as they exist today
features = feature_store.get_features(
    entity_id=user_id,
    feature_names=["user_purchase_count_30d", "user_age"],
    as_of=prediction_time  # ← critical!
)
```

**Why feature stores help:** Feature stores with time-travel capability store historical snapshots of feature values, enabling PIT-correct training data generation.

**Most common sources of leakage:** Target encoding (the label leaks into the feature), aggregations over future time windows, joins where the "as-of" time isn't enforced.

---

### Q271. What is the difference between feature selection and feature extraction?

**Answer:**

Both reduce the dimensionality of your input data, but through fundamentally different mechanisms.

**Feature selection:** Choose a *subset* of the original features to keep. Discard the rest.
- Original features are unchanged — just filtered
- Selected features remain interpretable ("user_age", "purchase_count")
- Methods: filter (correlation, statistical tests), wrapper (recursive feature elimination), embedded (L1/Lasso regularization selects features as part of training)

```python
# L1 regularization naturally zeroes out unimportant features
model = Lasso(alpha=0.01)
model.fit(X_train, y_train)
important_features = X.columns[model.coef_ != 0]
```

**Feature extraction:** Transform the original features into a *new* lower-dimensional representation.
- Creates new features (combinations of originals)
- New features may not be directly interpretable
- Methods: PCA (principal components), autoencoders, embeddings

```python
from sklearn.decomposition import PCA
pca = PCA(n_components=10)
X_reduced = pca.fit_transform(X_train)  # 100 features → 10 components
```

**When to use which:**
- Feature selection: when interpretability matters, when features have clear business meaning
- Feature extraction: when dealing with very high-dimensional data (images, text, genomics), when features are highly correlated

---

### Q272. What are embeddings and how are they served in production?

**Answer:**

**Embeddings** are dense vector representations of entities — words, users, products, images — where semantically similar items are close in vector space.

```
king  → [0.5, 0.3, -0.2, ...]  (300-dim vector)
queen → [0.5, 0.2, -0.1, ...]  (similar direction to king)
apple → [-0.8, 0.1, 0.7, ...]  (very different)
```

**Why they're powerful:** Traditional ML features are sparse (one-hot encoded categories). Embeddings are dense and capture semantic relationships — "Paris" and "France" are close in embedding space.

**Production serving challenges:**

**Latency:** Embedding lookup from a table of 10M products needs to be fast. Solution: in-memory key-value store (Redis) with 4-byte float arrays.

**Similarity search:** Finding the 10 most similar products requires comparing against millions of vectors. Exact search is too slow. Solution: approximate nearest neighbor (ANN) search with FAISS, Annoy, or a vector database (Pinecone, Weaviate).

**Freshness:** If user behavior changes, embeddings trained last month may not reflect current preferences. Schedule regular retraining + reindexing.

**Storage:** 10M products × 128-dim float32 = 5GB. Plan for this — Redis memory, vector DB capacity.

---

### Q273. What is the difference between feature normalization and standardization?

**Answer:**

Both scale features to a common range so that no single feature dominates the model due to its magnitude — but they do it differently.

**Normalization (Min-Max scaling):** Scales values to a fixed range, typically [0, 1].

```python
x_normalized = (x - x_min) / (x_max - x_min)
# age: [18, 90] → [0, 1]
```
- ✅ Bounded output range — useful for neural networks, image pixels
- ❌ Sensitive to outliers (one extreme value compresses everything else)

**Standardization (Z-score scaling):** Centers the distribution at mean=0 with std=1.

```python
x_standardized = (x - mean) / std
# age: mean=35, std=12 → values centered around 0
```
- ✅ Robust to outliers
- ✅ Works well for linear models, SVMs, PCA
- ❌ No bounded range

**When to use which:**
- Neural networks: normalization (bounded activations are better)
- Linear/logistic regression, SVM: standardization
- Tree-based models (Random Forest, XGBoost): neither needed — trees split on thresholds, not magnitudes
- KNN, K-means: always normalize/standardize — distance calculations are sensitive to scale

**Critical rule:** Fit the scaler on training data only. Apply (transform) to training and test data. Never fit on test data — that would leak test statistics into training.

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

### Q274. What is distributed training and what are the key strategies?

**Answer:**

**Distributed training** splits the training workload across multiple GPUs or machines — necessary when a model or dataset doesn't fit on a single device, or when you want to speed up training.

**Data parallelism:** Split the training data across workers. Each worker has a complete copy of the model and trains on its shard of data. Gradients are averaged across workers after each step.

```
Worker 1: batch 1-32  → gradients_1
Worker 2: batch 33-64 → gradients_2
Worker 3: batch 65-96 → gradients_3
                    ↓ AllReduce (average gradients)
           All workers update model with averaged gradient
```

- Scales well for large datasets
- Each worker needs to fit the full model in GPU memory

**Model parallelism:** Split the model itself across devices. Different layers on different GPUs.
- Necessary when a single model is too large for one GPU (GPT-4 style models)
- Pipeline parallelism: Layer groups in a pipeline, each GPU handles a stage

**Tensor parallelism:** Split individual weight matrices across GPUs — used for very large transformers.

**Tools:** PyTorch DDP (data parallel), DeepSpeed (ZeRO optimizer), Megatron-LM (tensor parallel for LLMs), FSDP (Fully Sharded Data Parallel).

---

### Q275. What is gradient checkpointing and when is it used?

**Answer:**

**Gradient checkpointing** (also called activation checkpointing) is a memory optimization technique for training large neural networks. Instead of storing all intermediate activations in GPU memory during the forward pass, it recomputes them during the backward pass.

**Normal training memory:**
```
Forward pass: store all activations for all layers → large GPU memory usage
Backward pass: use stored activations to compute gradients
```

**With gradient checkpointing:**
```
Forward pass: only store activations at "checkpointed" layers (every N layers)
Backward pass: for layers between checkpoints, recompute activations on the fly
→ Trade compute for memory (recompute cost: ~33% more FLOPS)
```

**When to use it:**
- Training large models (transformers, ResNets) that exceed GPU memory
- When you need a larger batch size but memory is the bottleneck
- Fine-tuning large pretrained models

```python
# PyTorch
from torch.utils.checkpoint import checkpoint
output = checkpoint(layer, input)  # recomputes layer during backward

# Hugging Face Transformers
model.gradient_checkpointing_enable()
```

**Trade-off:** ~20-40% slower training in exchange for significantly reduced memory. For a 2x memory reduction, you pay ~33% more compute. Almost always worth it when memory is the constraint.

---

### Q276. What is a learning rate scheduler and how does it affect training?

**Answer:**

A **learning rate scheduler** automatically adjusts the learning rate during training. The learning rate controls how large each gradient descent step is — too high causes divergence, too low means very slow convergence.

**Why dynamic scheduling helps:** A high LR early in training makes fast progress. A low LR later allows fine-grained convergence to the optimum.

**Common schedulers:**

**Step decay:** Reduce LR by a factor every N epochs.
```python
scheduler = StepLR(optimizer, step_size=30, gamma=0.1)  # LR × 0.1 every 30 epochs
```

**Cosine annealing:** LR follows a cosine curve from max to min. Smooth, widely used.
```python
scheduler = CosineAnnealingLR(optimizer, T_max=100)
```

**Warm-up then decay:** Start with a tiny LR, increase to target over first N steps, then decrease. Standard for transformers — prevents early training instability.
```python
# Hugging Face
scheduler = get_linear_schedule_with_warmup(
    optimizer, num_warmup_steps=1000, num_training_steps=10000
)
```

**One-cycle policy (fast.ai):** LR increases then decreases over one training cycle — often achieves better results faster.

**Rule of thumb:** Use cosine annealing or one-cycle for most tasks. Always use warmup when fine-tuning large pre-trained models.

---

### Q277. What is early stopping and how do you implement it correctly?

**Answer:**

**Early stopping** halts training when the validation metric stops improving — preventing overfitting and saving compute.

**How it works:**
```
After each epoch:
  If val_loss < best_val_loss:
    best_val_loss = val_loss
    save_checkpoint()
    patience_counter = 0
  Else:
    patience_counter += 1
    If patience_counter >= patience:
      Stop training
      Load best checkpoint
```

**The patience hyperparameter:** How many epochs to wait for improvement before stopping. Too low → stops too early (underfitting). Too high → wastes compute.

**Common mistakes:**

**Using test data for stopping:** You should monitor *validation* loss, never test loss. If you stop based on test performance, you've effectively trained on test data.

**Not restoring best weights:** After stopping, load the checkpoint from the best epoch — not the final epoch (which overfit).

**Wrong metric:** Track the metric you actually care about (AUC, F1) not just training loss.

```python
# Keras implementation
early_stopping = EarlyStopping(
    monitor='val_auc',
    patience=10,
    restore_best_weights=True,  # critical!
    mode='max'
)
```

---

### Q278. What is the bias-variance trade-off and how does it guide model selection?

**Answer:**

The **bias-variance trade-off** describes two sources of prediction error that pull in opposite directions as model complexity changes.

**Bias:** Error from overly simplistic assumptions. A linear model predicting a non-linear relationship has high bias — it *underfits*.

**Variance:** Error from sensitivity to small fluctuations in training data. A very deep tree memorizes the training set but fails on new data — it *overfits*.

```
Model complexity →

Low complexity:  High Bias  | Low Variance  (underfitting)
High complexity: Low Bias   | High Variance (overfitting)
Optimal:         Good Bias  | Good Variance (just right)
```

**Diagnosing:**
- High bias: training error high AND validation error high → model too simple
- High variance: training error low BUT validation error high → model too complex

**Fixes:**

| Problem | Solutions |
|---------|-----------|
| High bias (underfitting) | More features, larger model, reduce regularization |
| High variance (overfitting) | More data, regularization (L1/L2/dropout), simpler model, cross-validation, ensemble methods |

**In practice:** Start with a model complex enough to overfit intentionally (confirms the model can learn the signal), then add regularization to reduce variance. This is more reliable than starting too simple.

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

### Q279. How would you design a fraud detection system at scale?

**Answer:**

**Requirements:** Detect fraudulent transactions in real time (<100ms), handle millions of transactions/day, minimize false positives (blocking legitimate users), adapt to evolving fraud patterns.

**Architecture:**

**1. Real-time scoring layer:**
- Transaction arrives → feature computation (<10ms) → model inference (<20ms) → decision
- Features: transaction amount, merchant category, user history (last N transactions), device fingerprint, velocity (transactions per hour)
- Model: gradient boosted tree (GBM) — fast inference, good AUC, interpretable

**2. Feature pipeline:**
- Real-time features: computed on-the-fly (amount, merchant, time of day)
- Pre-computed features: pulled from feature store (user's average spend, account age) — must be fresh, computed by a streaming pipeline

**3. Decision engine:**
- Low risk score → approve
- High risk score → block
- Medium → step-up authentication (2FA challenge)

**4. Feedback loop:**
- Chargebacks and confirmed fraud → labeled data → retrain weekly
- Fraud patterns evolve → monitor feature drift, retrain frequently

**5. Explainability:**
- SHAP values: "This transaction was flagged because amount (3x user average) + new device + foreign country"
- Required for compliance and customer service disputes

**Scale numbers:** 10K TPS peak → needs sub-20ms p99 → no synchronous DB calls → feature store with sub-5ms p99.

---

### Q280. How would you design a search ranking system?

**Answer:**

**Core goal:** Given a user query, rank millions of candidate documents by relevance — in under 100ms.

**Two-stage retrieval + ranking:**

**Stage 1 — Retrieval (recall):** Quickly find top-K candidate documents (K ≈ 1000).
- **BM25** (inverted index, text matching) — fast, no ML needed
- **Embedding-based ANN** (semantic search) — handles synonyms and intent
- Run both in parallel, merge results

**Stage 2 — Ranking (precision):** Score the top-K candidates with a more expensive model.
- Features: text relevance, user signals (past clicks, dwell time), document quality (freshness, authority)
- Model: LambdaMART, XGBoost, or a small transformer

**Online learning:** Click-through rate and dwell time provide continuous supervision signal. Retrain ranking model regularly.

**Personalization layer:** Blend a universal ranking with user-specific signals (favorite categories, location, past history).

**Key infrastructure:**
- **Inverted index:** Elasticsearch or Solr
- **Vector index:** FAISS or Pinecone for semantic retrieval
- **Feature store:** Serve user features at <5ms
- **A/B testing framework:** Essential for ranking experiments

---

### Q281. How would you design a content moderation system using ML?

**Answer:**

**Requirements:** Detect harmful content (hate speech, spam, NSFW images) at scale, minimize false positives (incorrectly removing legitimate content), fast enough for pre-posting screening.

**Multi-layer architecture:**

**Layer 1 — Rule-based filters (fast, cheap):**
- Block known spam phrases, banned keywords, known bad URLs
- ~80% of spam caught here in milliseconds

**Layer 2 — ML classifiers:**
- Text: BERT-based classifier fine-tuned on labeled harmful content
- Images: CNN trained on safe/unsafe categories
- Fast inference: ONNX-quantized model, <50ms

**Layer 3 — Human review queue:**
- Cases the model is uncertain about (confidence 0.4-0.7)
- New patterns not in training data
- Appeals from users

**Feedback loop:**
```
Human moderator reviews → Labels → Retraining pipeline → Better model
```

**Challenges:**
- **Evolving tactics:** Spammers adapt. Model needs frequent retraining.
- **Context dependency:** "I want to kill it" is innocuous in gaming context.
- **Multilingual:** One model per language or multilingual model (mBERT, XLM-R).
- **False positive cost:** Incorrectly removing legitimate content harms user trust more than missing some bad content.

**Metrics to monitor:** Precision (how many removals are correct?), recall (how much harmful content is caught?), false positive rate (legitimate content removed).

---

### Q282. How would you design a personalization engine?

**Answer:**

**Goal:** Show each user content, products, or recommendations that are most relevant to them specifically.

**Core components:**

**1. User understanding layer:**
- Explicit: saved preferences, ratings, follows
- Implicit: clicks, dwell time, purchases, skips
- Demographic/contextual: location, device, time of day

**2. Candidate generation (retrieval):**
- Collaborative filtering: "users like you also liked..."
- Content-based: "items similar to what you've engaged with"
- Trending/diversity: ensure fresh and diverse candidates

**3. Ranking:**
- Score each candidate with a model using user features + item features + context
- Optimize for the long-term objective (not just immediate click — avoid clickbait trap)

**4. Diversity and freshness constraints:**
- Don't show all recommendations from one category
- Inject fresh content even if it has lower predicted CTR (exploration)

**5. A/B testing layer:**
- Different recommendation strategies tested in parallel
- Measure 7-day and 28-day engagement, not just click rate

**Cold start:** New users have no history. Solutions: onboarding survey (ask preferences), popularity-based recommendations, then quick personalization as signals accumulate.

---

### Q283. What is a feature platform and how does it power ML systems?

**Answer:**

A **feature platform** (or ML platform feature layer) is the infrastructure that handles the entire lifecycle of ML features: computation, storage, versioning, and serving.

**Problems it solves:**

**Without a feature platform:**
```
Team A builds user_age feature for fraud detection
Team B rebuilds the same user_age feature for recommendations
→ 2x compute, different implementations, potential inconsistency
```

**With a feature platform:**
```
user_age defined once → shared by fraud detection, recommendations, churn prediction
→ Single source of truth, computed once, served everywhere
```

**Components:**

**Feature registry:** Catalog of all defined features (schema, owner, description, lineage)

**Offline store:** Historical feature values for training (data warehouse, Delta Lake)

**Online store:** Low-latency feature lookup for inference (Redis, DynamoDB)

**Computation layer:** Feature pipelines (Spark for batch, Flink for streaming)

**Key capability — training/serving consistency:**
```
Training: features computed from offline store → same logic as online
Serving: features computed from online store → same logic as training
→ No training-serving skew
```

**Tools:** Feast (open source), Tecton, Vertex AI Feature Store, AWS SageMaker Feature Store.

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

### Q284. What is model quantization and how does it speed up inference?

**Answer:**

**Quantization** reduces the numerical precision of model weights and activations — from 32-bit floats (FP32) to 16-bit (FP16), 8-bit integers (INT8), or even 4-bit (INT4). This shrinks model size and speeds up inference, often with minimal accuracy loss.

**Why it works:** Modern hardware has specialized INT8 units that run 2-4x faster than FP32. Plus, smaller values mean less memory bandwidth — often the actual bottleneck.

**Types:**

**Post-training quantization (PTQ):** Quantize a trained model without retraining. Fast to apply, slight accuracy drop.
```python
import torch
model_quantized = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)
```

**Quantization-aware training (QAT):** Simulate quantization during training so the model adapts. Better accuracy, requires retraining.

**Typical trade-offs:**
| Precision | Size | Speedup | Accuracy drop |
|-----------|------|---------|---------------|
| FP32 | 100% | 1x | 0% |
| FP16 | 50% | 1.5-2x | <0.1% |
| INT8 | 25% | 2-4x | <1% |
| INT4 | 12.5% | 3-6x | 1-3% |

**Use cases:** Mobile deployment (INT8), LLM serving (INT4 with GPTQ/bitsandbytes), edge devices, real-time inference where latency is critical.

---

### Q285. What is dynamic batching in model serving?

**Answer:**

**Dynamic batching** automatically groups multiple individual inference requests arriving close in time into a single batch before sending to the model. This improves GPU utilization dramatically — GPUs are designed for parallel operations.

**The problem:**
```
Requests arrive one at a time:
req1 → model (batch size 1) → GPU at 5% utilization
req2 → model (batch size 1) → GPU at 5% utilization
...wasteful
```

**With dynamic batching:**
```
req1 arrives at t=0ms  → wait briefly
req2 arrives at t=2ms  → wait
req3 arrives at t=4ms  → wait
req4 arrives at t=6ms  → batch full or max_delay reached
→ model(batch=[req1, req2, req3, req4]) → GPU at 80% utilization
```

**Configuration parameters:**
- **Max batch size:** Upper limit (memory constraint)
- **Max delay:** Maximum time to wait for more requests to join the batch (e.g., 10ms)

**Trade-off:** Small latency increase (waiting for batch to fill) in exchange for significantly higher throughput and lower cost per request.

**Tools that support it:** NVIDIA Triton Inference Server (natively), TorchServe, TF Serving, vLLM (for LLMs — uses "continuous batching" variant).

**LLM continuous batching:** Requests join the batch as soon as a slot frees (vs. waiting for the whole batch to finish) — enables much higher GPU utilization for LLMs with variable-length outputs.

---

### Q286. What is model caching and when do you cache predictions?

**Answer:**

**Prediction caching** stores model outputs so that identical (or semantically similar) inputs don't require running inference again. Reduces latency and cost.

**Exact caching:** Cache the prediction for an exact input.
```python
cache_key = hash(frozenset(input_features.items()))
if cached := redis.get(cache_key):
    return cached
result = model.predict(input_features)
redis.setex(cache_key, ttl=3600, value=result)
return result
```

**When exact caching helps:**
- Recommendation systems where millions of users share similar feature vectors
- NLP models called with the same text repeatedly (FAQ chatbots)
- Image classification where the same image is submitted multiple times

**Semantic caching (for LLMs):** Embed the query, find similar cached queries using ANN search, return the cached response if similarity > threshold.
```
New query: "What is the capital of France?"
Cached:    "What's France's capital city?" → cosine similarity 0.97 → return "Paris"
```

**When NOT to cache:**
- User-specific predictions (the prediction is unique per user)
- Time-sensitive predictions (fraud score changes as context changes)
- High cardinality inputs (essentially unique every time)

**Cache TTL:** Set based on how quickly the underlying model or data changes — a model retrained weekly means predictions can safely be cached for days.

---

### Q287. What is a canary deployment for ML models?

**Answer:**

A **model canary deployment** gradually routes a small percentage of production traffic to a new model version while the old version handles the rest — letting you validate real-world performance before full rollout.

**How it works:**
```
100% of traffic → Model v1 (current champion)

Deploy v2 as canary:
  95% of traffic → Model v1
   5% of traffic → Model v2 (canary)

Monitor for 24 hours:
  - Latency, error rates (engineering metrics)
  - CTR, revenue, precision/recall (business metrics)

If v2 looks good: 50% → v2, then 100% → v2
If v2 has issues: rollback 5% back to v1, investigate
```

**Differences from software canary:**
- Must monitor business outcomes, not just system health — a model can be technically "up" but making worse predictions
- Requires statistical significance testing — 5% traffic for 1 hour may not be enough sample size to detect a 1% CTR difference
- Need holdout logging — log all predictions from both models with the eventual ground truth label to compare offline later

**Shadow deployment vs canary:** Shadow mode runs both models but only uses v1 for actual decisions (v2's predictions are discarded). Canary deployment actually serves v2 to real users.

---

### Q288. What is model serving infrastructure and what are the key components?

**Answer:**

**Model serving infrastructure** is everything needed to take a trained model and reliably deliver predictions to production applications.

**Key components:**

**1. Model server:** The process that loads the model and handles inference requests. Examples: TorchServe, TF Serving, NVIDIA Triton, vLLM, or a simple FastAPI service.

**2. Model registry:** Version-controlled store of trained models with metadata. The serving layer pulls from here. Examples: MLflow Model Registry, SageMaker Model Registry.

**3. Load balancer:** Distributes requests across multiple model server instances. Required for high availability and horizontal scaling.

**4. Autoscaling:** Scale model server instances up when traffic spikes, down when idle. GPU instances are expensive — scale to zero when possible.

**5. Request queue:** Buffer between clients and model servers. Smooths traffic spikes. Important for batch inference scenarios.

**6. Monitoring + logging:** Track every prediction's input, output, latency. Essential for debugging and drift detection.

**7. Feature retrieval layer:** For real-time features (user's last 10 clicks), call the feature store synchronously during inference. Must be fast (<5ms) to not dominate inference latency.

**Full request flow:**
```
Client → Load Balancer → Model Server
                                → Feature Store (fetch user features)
                                → Model inference
                                → Response
                        → Prediction Log → Monitoring
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

### Q289. What is data schema validation and what tools are used?

**Answer:**

**Data schema validation** checks that incoming data conforms to a defined structure — correct column names, expected data types, value ranges, and nullability constraints. It's the first line of defense against data quality issues silently corrupting ML pipelines.

**What to validate:**
- Column presence ("did user_age disappear from the feed?")
- Data types ("is purchase_amount always a float, not sometimes a string?")
- Value ranges ("is age always between 0 and 120?")
- Null rates ("null rate for email went from 2% to 40% — upstream bug")
- Cardinality ("country should have <250 unique values — new garbage values appearing?")

**Example with Great Expectations:**
```python
import great_expectations as gx
context = gx.get_context()

# Define expectations
batch.expect_column_values_to_not_be_null("user_id")
batch.expect_column_values_to_be_between("age", min_value=0, max_value=150)
batch.expect_column_values_to_be_in_set("status", ["active", "inactive", "pending"])
batch.expect_column_to_exist("purchase_amount")

# Run validation
result = context.run_validation_definition(validation_def)
if not result.success:
    alert_on_call()
    stop_pipeline()
```

**Tools:** Great Expectations, Pandera (schema validation for DataFrames), dbt tests (for SQL pipelines), TensorFlow Data Validation (TFDV).

---

### Q290. What is the difference between data completeness, accuracy, and consistency?

**Answer:**

These are three distinct dimensions of data quality, each requiring different checks.

**Completeness:** Is all expected data present?
- Missing rows ("we expected 1M daily events but got 600K")
- Missing values (null rates higher than expected)
- Missing partitions (yesterday's data didn't arrive)

```sql
-- Check completeness: row count vs expected
SELECT date, COUNT(*) as row_count 
FROM events 
WHERE date >= CURRENT_DATE - 7
GROUP BY date;
-- Alert if any day has <95% of expected volume
```

**Accuracy:** Does the data correctly reflect reality?
- Prices that are negative
- Ages of 999 (sentinel values treated as real)
- Timestamps in the future
- Duplicate transactions

**Consistency:** Is data consistent across systems and time?
- The count of active users in the users table matches the count in the events table
- A product price is the same in the product catalog and in the order records
- A metric calculated two different ways gives the same answer

**Why all three matter for ML:**
- Completeness issues → model trained on biased subset
- Accuracy issues → model learns wrong patterns
- Consistency issues → training-serving skew (model trained on one calculation, served with another)

---

### Q291. What is anomaly detection for data pipelines?

**Answer:**

**Pipeline anomaly detection** monitors the data flowing through a pipeline and automatically flags statistical anomalies — row count drops, sudden metric spikes, distribution shifts — before they silently corrupt downstream models or dashboards.

**Types of anomalies to detect:**

**Volume anomalies:** Significantly fewer or more rows than expected.
```python
# Track daily row counts and alert on deviations
if row_count < expected_count * 0.8:
    alert("Row count 20% below expected")
```

**Value anomalies:** Metrics (mean, median, std) shift significantly.
```python
# Use rolling statistics
z_score = (current_mean - rolling_mean) / rolling_std
if abs(z_score) > 3:
    alert(f"Mean shifted by {z_score:.1f} standard deviations")
```

**Freshness anomalies:** Data arrived later than expected.
```python
max_event_time = df["event_timestamp"].max()
if (now - max_event_time).hours > 2:
    alert("Data is more than 2 hours stale")
```

**Distribution anomalies:** Feature distributions changed (overlaps with feature drift monitoring).

**Tools:** Monte Carlo Data, Anomalo, dbt tests with custom thresholds, custom monitoring with Airflow.

**Best practice:** Run anomaly checks as the first task in every pipeline DAG — fail fast before wasting hours of compute on bad data.

---

### Q292. What is data lineage and why does it matter for ML?

**Answer:**

**Data lineage** tracks the origin and transformation history of data — where it came from, what transformations were applied, and what downstream systems depend on it.

**Visual example:**
```
raw_events (S3)
    → cleaned_events (Spark job: remove nulls, normalize timestamps)
        → user_features (aggregation: 30-day activity)
            → churn_model_v3 (training dataset)
                → churn_model_v3.pkl (model artifact)
                    → churn_predictions_api (production service)
```

**Why it's critical for ML:**

**Debugging:** "Our churn predictions changed last week" — lineage shows that `user_features` changed because `cleaned_events` changed because the upstream pipeline schema changed.

**Impact analysis:** "We need to update the raw_events schema" — lineage shows which models and pipelines will be affected.

**Audit and compliance:** GDPR "right to be forgotten" — lineage tells you every dataset and model that used a user's data, so you can delete it everywhere.

**Reproducibility:** Know exactly which version of which dataset trained which model.

**Tools:** OpenLineage (open standard), Marquez, DataHub, Apache Atlas, dbt (lineage for SQL).

---

### Q293. What is statistical process control for monitoring data quality?

**Answer:**

**Statistical Process Control (SPC)** is a method from manufacturing quality control, applied to data pipelines. Instead of static thresholds ("alert if row count < 1M"), SPC uses control charts based on historical statistics to dynamically determine what's "normal."

**Control chart basics:**
```
Upper Control Limit (UCL) = mean + 3 × std
Lower Control Limit (LCL) = mean - 3 × std

Values within UCL/LCL → normal variation → no alert
Values outside UCL/LCL → unusual, investigate
```

**Why static thresholds fail:** Your daily event count is 1.2M on weekdays and 600K on weekends. A static threshold of "alert if < 900K" would fire every weekend. SPC adapts to the data's own patterns.

**Implementation:**
```python
import pandas as pd

def compute_control_limits(series, window=30):
    rolling_mean = series.rolling(window).mean()
    rolling_std = series.rolling(window).std()
    ucl = rolling_mean + 3 * rolling_std
    lcl = rolling_mean - 3 * rolling_std
    return ucl, lcl

ucl, lcl = compute_control_limits(daily_row_counts)
today_count = get_today_count()
if today_count > ucl.iloc[-1] or today_count < lcl.iloc[-1]:
    alert(f"Row count outside control limits: {today_count}")
```

**Tools:** Monte Carlo Data, Anomalo, and custom implementations in Airflow/dbt all use variants of SPC for automated data quality monitoring.

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
