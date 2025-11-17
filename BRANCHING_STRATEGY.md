# AgriFlock360 Repository – Branching Strategy

This repository follows the GitFlow branching model to ensure stability, maintainability, and clean collaboration across all engineering teams.

---

## 🔹 Primary Branches

### **1. main**
- The production-ready, stable branch.
- Only merged into via Pull Requests from `develop`.
- Protected: No direct pushes allowed.

### **2. develop**
- The primary development branch.
- All features branch out from here.
- Protected: PR required to merge into develop.

---

## 🔹 Supporting Branch Types

### **1. feature/**
Used by individual engineers to implement new features.

**Naming convention:**
feature/<short-description>

makefile
Copy code
Examples:
feature/mobile-vaccination-module
feature/backend-auth-api
feature/web-dashboard-ui
feature/iot-firmware-sensor-calibration


### Workflow:
1. Branch from: `develop`
2. Work on feature
3. Push and create PR → `develop`
4. Review → Merge

---

### **2. hotfix/**
For emergency fixes directly applied to `main`.

hotfix/fix-mqtt-auth-bug


Merged into:
- `main`
- `develop`

---

### **3. release/**
Used when preparing a version for deployment.

release/v1.0.0


Tasks:
- Final testing
- Documentation updates
- Changelog updates

Merged into:
- `main`
- `develop`

---

## 🔹 Merge Rules

| Action | Allowed From | Allowed Into | Notes |
|-------|--------------|--------------|-------|
| Feature → Develop | feature/* | develop | PR + Review |
| Develop → Main | develop | main | PR + 1–2 reviews required |
| Hotfix → Main | hotfix/* | main | PR + optional review |
| Hotfix → Develop | hotfix/* | develop | Keep branches aligned |


---

## 🔹 CI/CD Requirements Before Merge
- Lint must pass
- Build must pass
- Tests (if configured) must pass
- PR must be reviewed and approved

---

## 🔹 Branch Protection Notes
Both `main` and `develop` must:
- Require Pull Request
- Require passing checks
- Prevent direct pushes
- Require review
