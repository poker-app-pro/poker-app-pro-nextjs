"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, AlertCircle, User } from "lucide-react"

type ProfileState = "idle" | "submitting" | "success" | "error"

export default function CreateProfilePage() {
  const router = useRouter()
  const [state, setState] = useState<ProfileState>("idle")
  const [error, setError] = useState("")

  // Form fields
  const [nickname, setNickname] = useState("")
  const [preferredGameTypes, setPreferredGameTypes] = useState<string[]>([])
  const [bio, setBio] = useState("")

  // Validation errors
  const [nicknameError, setNicknameError] = useState("")

  const gameTypes = ["Texas Hold'em", "Omaha", "Seven Card Stud", "Razz", "Five Card Draw", "2-7 Triple Draw"]

  const toggleGameType = (gameType: string) => {
    if (preferredGameTypes.includes(gameType)) {
      setPreferredGameTypes(preferredGameTypes.filter((type) => type !== gameType))
    } else {
      setPreferredGameTypes([...preferredGameTypes, gameType])
    }
  }

  const validateForm = (): boolean => {
    let isValid = true

    // Reset errors
    setNicknameError("")

    // Validate nickname
    if (!nickname) {
      setNicknameError("Nickname is required")
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setState("submitting")
    setError("")

    try {
      // This would be replaced with actual API call
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, show success state
      setState("success")

      // After 2 seconds, redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      console.log(err)
      setState("error")
      setError("An error occurred while creating your profile. Please try again.")
    }
  }

  const skipProfileCreation = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-medium text-center mb-1">Create Your Player Profile</h1>
        <p className="text-muted-foreground text-center mb-6">
          Set up your player profile to participate in tournaments
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {state === "success" ? (
          <div className="bg-primary/10 text-primary p-4 rounded mb-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
            <h2 className="font-medium text-lg mb-1">Profile Created Successfully!</h2>
            <p className="text-sm mb-4">Your player profile has been set up.</p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="nickname" className="material-label">
                  Nickname (displayed to other players)
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={`material-input ${nicknameError ? "border-destructive" : ""}`}
                  placeholder="PokerAce"
                  disabled={state === "submitting"}
                />
                {nicknameError && <p className="text-destructive text-xs mt-1">{nicknameError}</p>}
              </div>

              <div>
                <label className="material-label">Preferred Game Types</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {gameTypes.map((gameType) => (
                    <div key={gameType} className="flex items-center">
                      <input
                        id={`game-${gameType}`}
                        type="checkbox"
                        checked={preferredGameTypes.includes(gameType)}
                        onChange={() => toggleGameType(gameType)}
                        className="h-4 w-4 rounded border-gray-200 text-primary focus:ring-primary"
                        disabled={state === "submitting"}
                      />
                      <label htmlFor={`game-${gameType}`} className="ml-2 text-sm text-foreground">
                        {gameType}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="material-label">
                  Bio (Optional)
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="material-input min-h-[100px]"
                  placeholder="Tell other players about yourself..."
                  disabled={state === "submitting"}
                />
              </div>

              <button
                type="submit"
                className="material-button-primary w-full flex items-center justify-center gap-2"
                disabled={state === "submitting"}
              >
                {state === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Create Profile"
                )}
              </button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={skipProfileCreation}
                  className="text-muted-foreground hover:text-primary hover:underline"
                  disabled={state === "submitting"}
                >
                  Skip for now
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
