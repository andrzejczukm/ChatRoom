# Terraform configuration to set up providers.
terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
    }
  }
}


# Configure the provider not to use the specified project for quota check.
# This provider should only be used during project creation and initializing services.
provider "google-beta" {
  alias                 = "no_user_project_override"
  user_project_override = false
  credentials = file("./firebase-adminsdk.json")
}


# Configure the provider that uses the new project's quota.
provider "google-beta" {
  user_project_override = true
  credentials = file("./firebase-adminsdk.json")
}





# import existing gcloud project
import {
  to = google_project.default
  id = "chatroomtranslations"
}


resource "google_project" "default" {
  provider = google-beta.no_user_project_override
  project_id      = "chatroomtranslations"
  name            = "ChatRooms"

  # Required for the project to display in any list of Firebase projects.
  labels = {
    "firebase" = "enabled"
  }
}


# Enable the required underlying Service Usage API.
resource "google_project_service" "serviceusage" {
  provider = google-beta.no_user_project_override

  project = google_project.default.project_id
  service = "serviceusage.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}


# Enable the required underlying Firebase Management API.
resource "google_project_service" "firebase" {
  provider = google-beta.no_user_project_override

  project = google_project.default.project_id
  service = "firebase.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
}


# import existing firebase project
import {
  to = google_firebase_project.default
  id = "chatroomtranslations"
}


resource "google_firebase_project" "default" {
  provider = google-beta
}