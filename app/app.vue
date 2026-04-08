<template>
    <UApp>
        <Nav title="Mama Food" :enable-admin="session.loggedIn.value" />
        <NuxtPage class="bg-white"/>
    </UApp>
</template>
<script setup lang="ts">
const session = useUserSession();
</script>