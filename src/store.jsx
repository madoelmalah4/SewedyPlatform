"use client"

import { create } from "zustand"

const useGradesStore = create((set) => ({
  juniorGrades: [],
  wheelerGrades: [],
  seniorGrades: [],

  setJuniorGrades: (grades) => set({ juniorGrades: grades }),
  setWheelerGrades: (grades) => set({ wheelerGrades: grades }),
  setSeniorGrades: (grades) => set({ seniorGrades: grades }),
}))

export { useGradesStore }

