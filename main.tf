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
  id = "chatroomcloud"
}


resource "google_project" "default" {
  provider = google-beta.no_user_project_override
  project_id      = "chatroomcloud"
  name            = "ChatRoomTerraform"

  # Required for the project to display in any list of Firebase projects.
  labels = {
    "firebase" = "enabled"
  }
}


# Enables Cloud Resource Manager API.
# resource "google_project_service" "cloudresourcemanager" {
#   provider = google-beta.no_user_project_override

#   project  = google_project.default.project_id
#   service = "cloudresourcemanager.googleapis.com"

#   # Don't disable the service if the resource block is removed by accident.
#   disable_on_destroy = false
# }


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


resource "google_firebase_project" "default" {
  provider = google-beta
  project = google_project.default.project_id
}


# Creates a Firebase Web App in the new project created above.
resource "google_firebase_web_app" "rtdb" {
  provider     = google-beta
  project      = google_project.default.project_id
  display_name = "ChatRoomsApp"

  # The other App types (Android and Apple) use "DELETE" by default.
  # Web apps don't use "DELETE" by default due to backward-compatibility.
  deletion_policy = "DELETE"

  # Wait for Firebase to be enabled in the Google Cloud project before creating this App.
  depends_on = [
    google_firebase_project.default,
  ]
}