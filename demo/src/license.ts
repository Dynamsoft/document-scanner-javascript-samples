// Shared by the Document Scanner and Document Viewer SDKs.
// Set VITE_DYNAMSOFT_LICENSE, for example in .env.local, to use your own key.
// Without it, the demo uses the public trial license, valid for 24 hours.
// Request a 30-day trial key:
// https://www.dynamsoft.com/customer/license/trialLicense/?product=mds
export const LICENSE: string =
	import.meta.env.VITE_DYNAMSOFT_LICENSE ||
	"DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAwLTEwMzYzOTcyMSIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21sdHMuZHluYW1zb2Z0LmNvbS8iLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMCIsInN0YW5kYnlTZXJ2ZXJVUkwiOiJodHRwczovL3NsdHMuZHluYW1zb2Z0LmNvbS8iLCJjaGVja0NvZGUiOjEyOTQzODU5NDJ9";
