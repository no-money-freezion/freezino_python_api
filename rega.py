import requests

BASE_URL = "http://127.0.0.1:8002/api"


def run_test():
    reg_data = {
        "username": "string",
        "email": "test@test.com",
        "password": "123",
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    if response.status_code != 200:
        print("Ошибка регистрации!", response.text)
        return


if __name__ == "__main__":
    run_test()
