export default defineAppConfig({
    ui: {
        colors: {
            primary: "orange",
            secondary: "yellow",
            neutral: "zinc",
            warning: "amber",
            success: "green",
            error: "red"
        },
        input: {
            slots: {
                base: 'bg-blue-50 dark:bg-blue-900/20'
            }
        }
    },
})