<template>
    <UApp>
        <Nav title="Mama Food" :showDashBoard="isAdmin || isOperator" />
        <NuxtPage />
    </UApp>
</template>
<script setup lang="ts">
const { isAdmin, isOperator } = useUserAuth();
</script>