import requests

BASE_URL = "http://127.0.0.1:8002/api"


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

    print("\nПопытка начать работу (drug_dealer)...")
    work_data = {"job_type": "drug_dealer"}

    work_skip_jail = requests.post(
        f"{BASE_URL}/work/skip-jail", json=work_data, headers=headers
    )
    print("Побег из тюрьмы:", work_skip_jail.json())


if __name__ == "__main__":
    run_test()
