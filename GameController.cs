// GameController.cs
public class GameController : MonoBehaviour
{
    void GameReady()
    {
        // Игра готова к запуску
    }

    void StartGame()
    {
        // Начало игры по кнопке PLAY
    }
}

// SaveManager.cs
public class SaveManager : MonoBehaviour
{
    void LoadData(string data)
    {
        // Загрузка данных из облака
    }
}

// UserManager.cs
public class UserManager : MonoBehaviour
{
    void SetUserData(string jsonData)
    {
        // Обработка данных пользователя
        var user = JsonUtility.FromJson<UserData>(jsonData);
    }
}

// Для сохранения данных из Unity
public void SaveGame()
{
    string saveData = JsonUtility.ToJson(gameData);
    Application.ExternalCall("SaveGame", saveData);
}

public void ShareScore(int score)
{
    Application.ExternalCall("ShareScore", score);
}
