<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-6">Contact Us</h1>
        <div class="max-w-2xl mx-auto">
            <p class="text-lg mb-6">
                Have questions or want to get in touch? We'd love to hear from you!
            </p>
            
            <div class="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 class="text-2xl font-semibold mb-4">Get In Touch</h2>
                <div class="space-y-3">
                    <p><strong>Email:</strong> contact@example.com</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p><strong>Address:</strong> 123 Tech Street, San Francisco, CA 94102</p>
                </div>
            </div>

            <form class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1" for="contact-name">Name</label>
                    <input id="contact-name" type="text" class="w-full border rounded px-3 py-2" placeholder="Your name" />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1" for="contact-email">Email</label>
                    <input id="contact-email" type="email" class="w-full border rounded px-3 py-2" placeholder="your.email@example.com" />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1" for="contact-message">Message</label>
                    <textarea id="contact-message" rows="4" class="w-full border rounded px-3 py-2" placeholder="Your message..."></textarea>
                </div>
                <button type="submit" class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                    Send Message
                </button>
            </form>
        </div>
    </div>
</template>

<script setup>
    import { computed } from "vue";
    import { useLanguageStore } from '@/stores/language.js';

    const languageStore = useLanguageStore();
    const currentLanguage = computed(() => languageStore.getCurrentLanguage);
</script>