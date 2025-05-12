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
        addEmployment: builder.mutation({
            query: (employment) => ({
                url: "/api/Employment",
                method: "POST",
                body: employment,
            }),
            invalidatesTags: ["Employment"], // Invalidate the list when adding
        }),
        getEmployment: builder.query({
            query: () => ({
                url: "/api/Employment",
                method: "GET",
            }),
        }),
        editEmployment: builder.mutation({
            query: (body) => ({
                url: `/api/Employment?z=${body?.z}&email=${body?.email}`, // <<< LIKELY NEEDS ID IN URL
                method: 'PUT', 
            }),
        }),
        addAdminUser: builder.mutation({ // Keep clear name
            
            query: ({ name, password, role }) => ({
                // Use the exact URL from the image
                url: "/api/Teacher/sign up",
                method: "POST", // Method is POST as per image
                // Send data as query parameters using the 'params' key
                params: {
                    name,    // Parameter name matches backend expectation
                    password,// Parameter name matches backend expectation
                    role     // Parameter name matches backend expectation
                },
            }),
        }),
        getUsers: builder.query({
            query: () => ({
                url: "/api/Teacher",
                method: "GET",
            }),
            invalidatesTags: ["User", "Admin"], // Adjust tags as needed

        }),
        deleteUser: builder.mutation({
            query: (name) => ({
                url: `/api/Teacher?name=${name}`,
                method: "DELETE",
                // ❌ Don't send body for DELETE with query param
            }),
            invalidatesTags: ["User", "Admin"],
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
    useEditAcheivmentStatusMutation,
    useAddEmploymentMutation,
    useGetEmploymentQuery,
    useEditEmploymentMutation,
    useAddAdminUserMutation,
    useGetUsersQuery,
    useLazyGetUsersQuery,
    useDeleteUserMutation,
    useLazyGetEmploymentQuery
} = authApiSlice;
