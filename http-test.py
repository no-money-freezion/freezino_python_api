import requests

BASE_URL = "http://127.0.0.1:8000/api"


def run_test():
    login_data = {
        "email": "test@test.com",
        "password": "123",
    }

    print(f"Попытка входа как {login_data['email']}...")
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)

    if response.status_code != 200:
        print("Ошибка входа!", response.text)
        return

    token = response.json()["data"]["access_token"]
    print(f"Успешный вход! Токен получен: {token[:10]}...")

    headers = {"Authorization": f"Bearer {token}"}

    print("\nПопытка начать работу (Office)...")
    work_data = {"job_type": "office"}

    work_response = requests.post(
        f"{BASE_URL}/work/start", json=work_data, headers=headers
    )
    work_status = requests.get(
        f"{BASE_URL}/work/status", json=work_data, headers=headers
    )
    print(f"Статус ответа: {work_response.status_code}")
    print("Тело ответа:", work_response.json())
    print("Рабочий статус юзера:", work_status.json())


if __name__ == "__main__":
    run_test()
