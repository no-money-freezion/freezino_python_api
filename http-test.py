import requests

BASE_URL = "http://127.0.0.1:8003/api"


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

    print("\nПопытка начать работу (office)...")
    work_data = {"job_type": "office"}
    #
    work_response = requests.post(
        f"{BASE_URL}/work/start", json=work_data, headers=headers
    )
    work_status = requests.get(
        f"{BASE_URL}/work/status", json=work_data, headers=headers
    )
    work_check = requests.post(
        f"{BASE_URL}/work/complete", json=work_data, headers=headers
    )
    # work_cancel = requests.post(
    #     f"{BASE_URL}/work/cancel", json=work_data, headers=headers
    # )
    # work_jobs = requests.get(f"{BASE_URL}/work/jobs", json=work_data, headers=headers)
    work_skip_jail = requests.post(
        f"{BASE_URL}/work/skip-jail", json=work_data, headers=headers
    )
    user_profile = requests.get(
        f"{BASE_URL}/user/profile", json=work_data, headers=headers
    )
    print(f"Статус ответа: {work_response.status_code}")
    print("Тело ответа:", work_response.json())
    print("Рабочий статус юзера:", work_status.json())
    print("Проверка на завершенность:", work_check.json())
    print("Профиль пользователя:", user_profile.json())
    # print("Отмена:", work_cancel.json())
    # print(f"Cписок работ: {work_jobs.json()}")
    # print("Побег из тюрьмы:", work_skip_jail.json())


if __name__ == "__main__":
    run_test()
