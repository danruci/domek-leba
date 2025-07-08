# Leba Domek – Interactive Property Website with AI Chatbot and Google Calendar Integration


## Overview
Leba Domek is a static website created to showcase a vacation rental in Łeba, Poland. The site features a fully integrated AI chatbot that automates responses to customer questions and checks availability in real-time using Google Calendar. The goal of the project is to reduce manual inquiries, improve customer experience, and demonstrate practical no-code/low-code skills.


## Problem & Solution
### The Problem
Managing bookings manually and answering repetitive inquiries can be time-consuming and error-prone, especially for seasonal property rentals with small teams. Booking conflicts and delays in replies can result in lost customers.


### The Solution
An AI-powered chatbot, available 24/7, handles inquiries about availability and property details. It uses:

Google Calendar to check availability in real-time.

Predefined logic for check-in/check-out to avoid overlap.

Natural language understanding to answer questions like:

"Can I bring a dog?"

"How many people can sleep here?"

"How far is it to the beach?"


## Key Features
Modern, responsive website for mobile and desktop.

Image gallery with smooth scrolling and modern layout.

AI chatbot (via Gemini API and Make.com) with:

Real-time Google Calendar integration.

Built-in check-in/check-out logic.

Smart answers based on predefined prompts.

Custom domain: lebadomek.pl

Fast global hosting via Cloudflare Pages.


## Technology Stack
| Category | Tools |
|---------|-------|
| **Frontend** | HTML, CSS, JavaScript |
| **AI & Logic** | Google Gemini API, Make.com (for automation and integrations) |
| **Data** | Google Calendar API |
| **Hosting & CI/CD** | GitHub, Cloudflare Pages |


## Deployment
The project is live at: 👉 https://lebadomek.pl

Note: Full DNS propagation may take up to 48h.

## Run Locally (for learning purposes)
git clone https://github.com/danruci/domek-leba.git
cd domek-leba
open index.html

