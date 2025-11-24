# HTTP Chat Application Between Two GCP Virtual Machines

### *Full Report / README Document*

---
*Team members*
*Gayashan K.D.D - IT_IFLS_001/B003/0012*
*Piumantha R.W.S - IT_IFLS_001/B003/0035*
*Samarawickrama N.S. - IT_IFLS_001/B003/0042*
*Dasantha Jayathilaka - IT_UGC_001/B003/0020*
*Kavinda E.A.I. - IT_IFLS_001/B003/0026*
---

## **1. Introduction**

This report describes the design and deployment of a lightweight **HTTP-based chat application** running on **two Google Cloud Platform (GCP) Virtual Machines (VMs)**.

The purpose of the project is to demonstrate:

* Hosting applications on cloud environments
* Communication between two servers using HTTP
* AJAX-based message exchange without page reload
* Setting up firewall rules on GCP
* Basic full-stack development using **Node.js (backend)** and **Next.js (frontend)**

---

## **2. Objective**

The main objective of this practical is to create two separate VMs on GCP and enable them to communicate by exchanging messages using HTTP.

Each VM hosts:

* A **Node.js/Express backend** (port 5000)
* A **Next.js frontend** (port 3000)

Users connected to each VM can send messages to the other VM in real-time using AJAX requests.

---

## **3. Overall System Architecture**

Refer to the image in the repository 

---

## **4. Tools & Technologies Used**

### **Backend**

* Node.js
* Express.js
* JSON-based message storage

### **Frontend**

* Next.js
* React Hooks
* Fetch API (AJAX requests)

### **Cloud / Deployment**

* Google Cloud Platform (GCP)
* Compute Engine Virtual Machines (Ubuntu 24.04 LTS)
* GCP Firewall Rules
* SSH Terminal

---

## **5. Features**

### ✔ **Real-time chat system**
### ✔ **Simple and user-friendly UI**

---

## **6. Step-by-Step Implementation Guide**

---

# **6.1 Installing Node.js and Required Tools**

---

# **6.2 Backend Setup (Node.js/Express)**

### Install & RUN
Navigate to the project folder

```bash
cd backend
npm install
node server.js
```
---

# **6.3 Frontend Setup (Next.js)**
Navigate to the root folder of the project
### Install and Run
```bash
cd frontend
npm install
npm run dev
```
### Build (only if needed)
```bash
npm run build
npm start
```

# **8. Networking & Firewall Summary**

### GCP firewall must allow:

* TCP **3000** (frontend)
* TCP **5000** (backend)

---

