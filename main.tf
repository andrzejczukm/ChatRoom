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
  id = "chatroomterraform0"
}


resource "google_project" "default" {
  provider = google-beta.no_user_project_override
  project_id      = "chatroomterraform0"
  name            = "ChatRoomTerraform"

  # Required for the project to display in any list of Firebase projects.
  labels = {
    "firebase" = "enabled"
  }
}


# Enables Cloud Resource Manager API.
resource "google_project_service" "cloudresourcemanager" {
  provider = google-beta.no_user_project_override

  project  = google_project.default.project_id
  service = "cloudresourcemanager.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false
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

  depends_on = [ 
    google_project_service.serviceusage,
  ]
}


# Enable Firebase Realtime Database API.
resource "google_project_service" "firebasedatabase" {
  provider = google-beta.no_user_project_override

  project = google_project.default.project_id
  service = "firebasedatabase.googleapis.com"

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false

  depends_on = [ 
    google_project_service.firebase,
  ]
}


# Enables required APIs for Cloud Storage in Firebase
resource "google_project_service" "firebasestorage" {
  provider = google-beta.no_user_project_override
  project  = google_project.default.project_id
  for_each = toset([
    "firebaserules.googleapis.com",
    "firebasestorage.googleapis.com",
    "storage.googleapis.com",
  ])
  service = each.key

  # Don't disable the service if the resource block is removed by accident.
  disable_on_destroy = false

  depends_on = [ 
    google_project_service.firebase,
  ]
}


# Enable Firebase services
resource "google_firebase_project" "default" {
  provider = google-beta
  project = google_project.default.project_id

  depends_on = [ 
    google_project_service.firebase, 
  ]
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


# Provisions the default Realtime Database default instance.
resource "google_firebase_database_instance" "database" {
  provider    = google-beta
  project     = google_project.default.project_id
  region      = "europe-west1"
  # This value will become the first segment of the database's URL.
  instance_id = "${google_project.default.project_id}-default-rtdb"
  type        = "DEFAULT_DATABASE"

  # Wait for Firebase to be enabled in the Google Cloud project before initializing Realtime Database.
  depends_on = [
    google_firebase_project.default,
    google_project_service.firebasedatabase,
  ]
}


# Creates a ruleset of Cloud Storage Security Rules from a local file.
# resource "google_firebaserules_ruleset" "storage" {
#   provider = google-beta
#   project  = google_project.default.project_id
#   source {
#     files {
#       name    = "storage.rules"
#       content = file("firebase_rules/storage.rules")
#     }
#   }

#   # Wait for the default Storage bucket to be provisioned before creating this ruleset.
#   depends_on = [
#     google_firebase_project.default,
#   ]
# }
