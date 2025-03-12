import { api } from "../ApiSlice";

export const authApiSlice = api.injectEndpoints({
    endpoints: (builder) => ({
        // ✅ Login Mutation
        login: builder.mutation({
            query: (credentials) => ({
                url: "api/Teacher",
                method: "POST",
                body: { ...credentials },
            }),
        }),

        // ✅ Submit Form Mutation
        formSubmit: builder.mutation({
            query: (credentials) => ({
                url: "api/Projects_Information",
                method: "POST",
                body: { ...credentials },
            }),
        }),

        // ✅ Fetch All Work Query (with lazy loading support)
        getAllWork: builder.query({
            query: () => ({
                url: "api/Projects_Information",
                method: "GET",
            }),
        }),

        // ✅ Get Achievements Query (with lazy loading support)
        getAchievements: builder.query({
            query: () => ({
                url: "api/Achivments/get",
                method: "GET",
            }),
        }),

        // ✅ Add Achievement Mutation
        addAchievement: builder.mutation({
            query: (credentials) => ({
                url: "api/Achivments/add",
                method: "POST",
                body: { ...credentials },
            }),
        }),

        // ✅ Delete Achievement Mutation (by title as query parameter)
        deleteAchievement: builder.mutation({
            query: ({ title }) => ({
                url: `/api/Achivments`,
                method: "DELETE",
                params: { title }, // Ensure proper query param handling
            }),
        }),
        editAcheivmentStatus: builder.mutation({
            query: (credentials) => ({
                url: `/api/Projects_Information`,
                method: "PUT",
                params: { ...credentials }, // Ensure proper query param handling
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useFormSubmitMutation,
    useLazyGetAllWorkQuery,
    useLazyGetAchievementsQuery,
    useAddAchievementMutation,
    useDeleteAchievementMutation, // Export the DELETE mutation
    useEditAcheivmentStatusMutation
} = authApiSlice;
