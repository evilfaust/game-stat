import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, Spin, Alert, message, Select, DatePicker, Input, Form, Space } from 'antd';

const { Option } = Select;

const SendData = () => {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parsingLoading, setParsingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchData, setMatchData] = useState({
    date: null,
    team1: null,
    team2: null,
    map: '',
    score: '',
    winner: null,
  });
  const [currentMatchId, setCurrentMatchId] = useState(null);
  const [form] = Form.useForm();

  // Загрузка данных после аутентификации
  useEffect(() => {
      const fetchData = async () => {
        try {
          const [teamsResponse, playersResponse, matchesResponse] = await Promise.all([
            axios.get('https://apigame.emcotech.ru/api/collections/team/records'),
            axios.get('https://apigame.emcotech.ru/api/collections/Player/records'),
            axios.get('https://apigame.emcotech.ru/api/collections/esl1_matches/records'),
          ]);

          setTeams(teamsResponse.data.items);
          setPlayers(playersResponse.data.items);
          setMatches(matchesResponse.data.items);
        } catch (error) {
          console.error('Ошибка при загрузке данных:', error);
          message.error('Ошибка при загрузке начальных данных');
        }
      };

      fetchData();
  }, []);

  // Обновление списка матчей
  const refreshMatches = async () => {
    try {
      const response = await axios.get('https://apigame.emcotech.ru/api/collections/esl1_matches/records');
      setMatches(response.data.items);
    } catch (error) {
      console.error('Ошибка при обновлении списка матчей:', error);
    }
  };

  // Обработчик изменения файла
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      message.success(`${selectedFile.name} успешно загружен`);
    } else {
      setFile(null);
    }
  };

  // Обработчик изменения данных матча
  const handleMatchDataChange = (key, value) => {
    setMatchData((prev) => ({ ...prev, [key]: value }));
  };

  // Создание нового матча
  const handleCreateMatch = async () => {
    if (!matchData.date || !matchData.team1 || !matchData.team2 || !matchData.map || !matchData.score || !matchData.winner) {
      message.warning('Пожалуйста, заполните все поля матча');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://apigame.emcotech.ru/api/collections/esl1_matches/records', matchData);
      message.success('Матч успешно создан');
      setCurrentMatchId(response.data.id);

      // Обновляем список матчей
      await refreshMatches();

      // Автоматически выбираем новый матч в таблице данных
      const updatedData = parsedData.map((item) => ({
        ...item,
        match_id: response.data.id,
      }));
      setParsedData(updatedData);
    } catch (error) {
      console.error('Ошибка при создании матча:', error);
      message.error('Произошла ошибка при создании матча');
    } finally {
      setLoading(false);
    }
  };

  // Парсинг демо-файла
  const handleParseDemoFile = async () => {
    if (!file) {
      message.warning('Пожалуйста, выберите файл');
      return;
    }

    setParsingLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('demo', file);

    try {
      const response = await axios.post('http://127.0.0.1:5005/parse-demo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Добавляем поля для редактирования в каждую запись
      const processedData = response.data.map((item) => ({
        ...item,
        match_id: currentMatchId, // По умолчанию устанавливаем текущий матч
        team_id: null, // Будет выбрано пользователем
        editable: true,
      }));

      setParsedData(processedData);
      message.success('Файл успешно обработан');
    } catch (error) {
      if (error.response && error.response.status === 413) {
        setError('Файл слишком большой. Максимальный размер — 500 МБ.');
      } else {
        setError('Произошла ошибка при обработке файла');
      }
      console.error('Ошибка:', error);
    } finally {
      setParsingLoading(false);
    }
  };

  // Обработчик изменения данных в таблице
  const handleCellChange = (key, dataIndex, value) => {
    const newData = [...parsedData];
    const target = newData.find((item) => item.steamid === key);
    if (target) {
      target[dataIndex] = value;
      setParsedData(newData);
    }
  };

  // Отправка статистики игроков
  const handleSendPlayerStats = async () => {
    if (parsedData.length === 0) {
      message.warning('Нет данных для отправки');
      return;
    }

    // Проверка обязательных полей
    const missingFields = parsedData.some((player) => !player.match_id || !player.team_id);
    if (missingFields) {
      message.warning('Пожалуйста, заполните все обязательные поля (матч и команда) для всех игроков');
      return;
    }

    setLoading(true);
    try {
      for (const playerStat of parsedData) {
        // Ищем игрока в коллекции Player по SteamID
        const player = players.find((p) => p.SteamID === playerStat.steamid);

        // Формируем данные для отправки
        const playerStatsData = {
          match_id: playerStat.match_id,
          player_id: player ? player.id : null,
          team_id: playerStat.team_id, // Используем выбранную команду
          n_rounds: playerStat.n_rounds,
          dmg: playerStat.dmg,
          adr: playerStat.adr,
          kast_rounds: playerStat.kast_rounds,
          kast: playerStat.kast,
          impact: playerStat.impact,
          rating: playerStat.rating,
        };

        // Отправляем статистику игрока
        await axios.post('https://apigame.emcotech.ru/api/collections/esl1_PlayerStats/records', playerStatsData);
      }

      message.success('Статистика игроков успешно отправлена');
      // Очищаем данные после успешной отправки
      setParsedData([]);
      setFile(null);
    } catch (error) {
      console.error('Ошибка при отправке статистики игроков:', error);
      message.error('Произошла ошибка при отправке статистики игроков');
    } finally {
      setLoading(false);
    }
  };

  // Определение столбцов таблицы
  const columns = [
    {
      title: 'Игрок',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
    },
    {
      title: 'SteamID',
      dataIndex: 'steamid',
      key: 'steamid',
      width: '15%',
    },
    {
      title: 'Матч',
      dataIndex: 'match_id',
      key: 'match_id',
      width: '15%',
      render: (text, record) => (
        <Select
          style={{ width: '100%' }}
          value={record.match_id}
          onChange={(value) => handleCellChange(record.steamid, 'match_id', value)}
          placeholder="Выберите матч"
        >
          {matches.map((match) => (
            <Option key={match.id} value={match.id}>
              {match.team1_name || 'Команда 1'} vs {match.team2_name || 'Команда 2'} ({match.map})
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Команда',
      dataIndex: 'team_id',
      key: 'team_id',
      width: '15%',
      render: (text, record) => (
        <Select
          style={{ width: '100%' }}
          value={record.team_id}
          onChange={(value) => handleCellChange(record.steamid, 'team_id', value)}
          placeholder="Выберите команду"
        >
          {teams.map((team) => (
            <Option key={team.id} value={team.id}>
              {team.Name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Раунды',
      dataIndex: 'n_rounds',
      key: 'n_rounds',
      width: '8%',
    },
    {
      title: 'Урон',
      dataIndex: 'dmg',
      key: 'dmg',
      width: '8%',
    },
    {
      title: 'ADR',
      dataIndex: 'adr',
      key: 'adr',
      width: '8%',
    },
    {
      title: 'KAST',
      dataIndex: 'kast',
      key: 'kast',
      width: '8%',
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      width: '8%',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: '8%',
    },
  ];

  // Если пользователь не авторизован, показываем форму входа
  // if (!isAuthenticated) {
  //   return (
  //     <div style={{ padding: '24px', maxWidth: '400px', margin: '0 auto' }}>
  //       <h1>Авторизация</h1>
  //       <LoginForm onLogin={setIsAuthenticated} />
  //     </div>
  //   );
  // }

  // Основной интерфейс
  return (
    <div style={{ padding: '24px' }}>
      <h1>CS2 Demo Parser</h1>

      {/* Шаг 1: Создать матч */}
      <div style={{ background: '#f0f2f5', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h2>Шаг 1: Создать матч</h2>
        <Form layout="vertical" form={form}>
          <Form.Item label="Дата матча" required>
            <DatePicker
              onChange={(date) => handleMatchDataChange('date', date)}
              style={{ width: '100%' }}
              placeholder="Выберите дату"
            />
          </Form.Item>

          <Space style={{ display: 'flex', width: '100%' }} align="start">
            <Form.Item label="Команда 1" required style={{ flex: 1 }}>
              <Select
                placeholder="Выберите команду 1"
                style={{ width: '100%' }}
                onChange={(value) => handleMatchDataChange('team1', value)}
              >
                {teams.map((team) => (
                  <Option key={team.id} value={team.id}>
                    {team.Name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Команда 2" required style={{ flex: 1 }}>
              <Select
                placeholder="Выберите команду 2"
                style={{ width: '100%' }}
                onChange={(value) => handleMatchDataChange('team2', value)}
              >
                {teams.map((team) => (
                  <Option key={team.id} value={team.id}>
                    {team.Name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Space style={{ display: 'flex', width: '100%' }} align="start">
            <Form.Item label="Карта" required style={{ flex: 1 }}>
              <Input
                placeholder="Название карты"
                onChange={(e) => handleMatchDataChange('map', e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Счет" required style={{ flex: 1 }}>
              <Input
                placeholder="Например: 16-14"
                onChange={(e) => handleMatchDataChange('score', e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Победитель" required style={{ flex: 1 }}>
              <Select
                placeholder="Выберите победителя"
                style={{ width: '100%' }}
                onChange={(value) => handleMatchDataChange('winner', value)}
              >
                {teams.map((team) => (
                  <Option key={team.id} value={team.id}>
                    {team.Name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Button
            type="primary"
            onClick={handleCreateMatch}
            loading={loading}
          >
            Создать матч
          </Button>
        </Form>
      </div>

      {/* Шаг 2: Загрузить и обработать демо-файл */}
      <div style={{ background: '#f0f2f5', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <h2>Шаг 2: Загрузить и обработать демо-файл</h2>
        <input
          type="file"
          accept=".dem"
          onChange={handleFileChange}
          style={{ display: 'block', marginBottom: '16px' }}
        />

        <Button
          type="primary"
          onClick={handleParseDemoFile}
          disabled={!file || parsingLoading}
        >
          {parsingLoading ? <Spin size="small" /> : 'Обработать файл'}
        </Button>

        {error && (
          <Alert
            message="Ошибка"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: '16px' }}
          />
        )}
      </div>

      {/* Шаг 3: Настроить и отправить статистику игроков */}
      {parsedData.length > 0 && (
        <div style={{ background: '#f0f2f5', padding: '20px', borderRadius: '8px' }}>
          <h2>Шаг 3: Настроить и отправить статистику игроков</h2>
          <p>Для каждого игрока выберите матч и команду, затем отправьте данные.</p>

          <Table
            columns={columns}
            dataSource={parsedData}
            rowKey="steamid"
            pagination={false}
            style={{ marginBottom: '20px' }}
            scroll={{ x: 'max-content' }}
          />

          <Button
            type="primary"
            onClick={handleSendPlayerStats}
            loading={loading}
            style={{ marginTop: '16px' }}
          >
            Отправить статистику игроков
          </Button>
        </div>
      )}
    </div>
  );
};

export default SendData;
