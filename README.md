# base_feature
This repository will help as a basis for the development and implementation of future projects where the django backend and vue3 frontend are used.

# How to Run the Project

## Clone the repository:
```bash
git clone https://github.com/carlos18bp/base_feature.git
cd base_feature
```

## Find and change base_feature occurrences to your repository name:
```bash
ag base_feature
```

## Install virtualenv:
```bash
pip install virtualenv
```

## To create a new virtual env:
```bash
virtualenv name_virtual_env
```

## Create virtual env:
```bash
virtualenv base_feature_env
```

## Activate virtual env:
```bash
source base_feature_env/bin/activate
```

## Create dependencies file:
```bash
pip freeze > requirements.txt
```

## Install dependencies:
```bash
pip install -r requirements.txt
```

## Desactivate virtual env:
```bash
deactivate
```

## Run makemigrations:
```bash
python3 manage.py makemigrations
```

## Run migrations:
```bash
python3 manage.py migrate
```

## Create superuser:
```bash
python3 manage.py createsuperuser
```

## Create fake data:
```bash
python3 manage.py create_fake_data
```

## Start the server:
```bash
python3 manage.py runserver
```

## Delete fake data:
```bash
python3 manage.py delete_fake_data
```

## Frontend setup:
```bash
cd frontend
npm install
npm run dev
```

You can also see other examples like reference implementations:

- [Candle Project](https://github.com/carlos18bp/candle_project)
- [Jewel Project](https://github.com/carlos18bp/jewel_project)
- [Dress Rental Project](https://github.com/carlos18bp/dress_rental_project)

If you need an implementation for user login and registration, use:
- [Sign In/Sign On Feature](https://github.com/carlos18bp/signin_signon_feature)



# Setting Up Jest in Vue 3 with Vite

This guide provides step-by-step instructions to install and configure Jest for a Vue 3 project using Vite. It also includes an example test configuration.

## Prerequisites

Ensure you have Node.js and npm installed.

### Installing Node.js and npm

1. **Check if Node.js and npm are installed:**

    Open a terminal and run the following commands:

    ```bash
    node -v
    npm -v
    ```

    If Node.js and npm are installed, these commands will display their versions. If not, proceed to install them.

2. **Install Node.js and npm:**

    - **Linux:**

        Use a package manager to install Node.js and npm. For example, on Ubuntu, you can use the following commands:

        ```bash
        sudo apt update
        sudo apt install nodejs npm
        ```

## Step 1: Create a New Vue 3 Project with Vite

If you don't already have a Vue 3 project, create one using the following commands:

```bash
npm init @vitejs/app my-vue-app --template vue
cd my-vue-app
npm install
```

## Step 2: Configure Project for ESM

In your `package.json`, add the following property:

```json
{
  "type": "module",
  "scripts": {
    ...,
    ..., 
    "test": "jest --config jest.config.cjs"
  }
}
```

## Step 3: Install Jest and Necessary Dependencies

Install Jest and other necessary dependencies for testing Vue components:

```bash
npm install --save-dev jest babel-jest @vue/test-utils @vue/vue3-jest @babel/core @babel/preset-env jest-environment-jsdom @testing-library/jest-dom jest-transform-stub identity-obj-proxy axios-mock-adapter
```

## Step 4: Configure Babel

Create a `babel.config.cjs` file in the root directory with the following content:

```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }]
  ]
};
```

## Step 5: Configure Jest

Create a `jest.config.cjs` file in the root directory with the following content:

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest',
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub"
  },
  testEnvironment: 'jest-environment-jsdom',
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass|png)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['./jest.setup.js']
};
```

## Step 6: Create Jest Setup File

Create a `jest.setup.js` file in the root directory with the following content:

```javascript
import '@testing-library/jest-dom';
```

## Step 7: Write a Sample Test

Create a component named `/components/HelloWorld.vue` to test purposes:

```vue
<template>
  <div>
    <h1>{{ msg }}</h1>
  </div>
</template>

<script setup>
const props = defineProps({
  msg: {
    type: String,
    required: true
  }
});
</script>
```

Create a directory named `test` in the root of your project and add a file named `HelloWorld.test.js` with the following content:

```javascript
import { mount } from '@vue/test-utils';
import HelloWorld from '@/components/HelloWorld.vue';

test('renders a message', () => {
  const wrapper = mount(HelloWorld, {
    props: {
      msg: 'Hello Vue 3'
    }
  });
  expect(wrapper.text()).toContain('Hello Vue 3');
});
```

## Step 8: Run the Tests

Run your tests using the following command:

```bash
npm run test
```

## Summary

This guide helps you set up Jest for a Vue 3 project using Vite with ESM. It covers the installation of dependencies, configuration of Babel and Jest, and provides a sample test to ensure everything is working correctly. With these steps, you can easily integrate Jest into your Vue 3 projects for efficient testing.
