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