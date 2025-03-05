import React, { useState, useEffect } from 'react';
import { Button, Form, Space, DatePicker, Select, Input, message, Spin } from 'antd';
import axios from 'axios';

const { Option } = Select;

const CreateMatch = () => {
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [form] = Form.useForm();
  const [matchData, setMatchData] = useState({
    date: null,
    team1: null,
    team2: null,
    map: '',
    score: '',
    winner: null,
  });
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Загружаем список команд при монтировании компонента
  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true);
      try {
        const response = await axios.get('https://apigame.emcotech.ru/api/collections/team/records');
        setTeams(response.data.items);
      } catch (error) {
        console.error('Ошибка при загрузке команд:', error);
        messageApi.error('Ошибка при загрузке данных команд');
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [messageApi]);

  const handleMatchDataChange = (key, value) => {
    setMatchData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateMatch = async () => {
    if (
      !matchData.date ||
      !matchData.team1 ||
      !matchData.team2 ||
      !matchData.map ||
      !matchData.score ||
      !matchData.winner
    ) {
      messageApi.warning('Пожалуйста, заполните все поля матча');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://apigame.emcotech.ru/api/collections/esl1_matches/records',
        matchData
      );
      messageApi.success('Матч успешно создан');
      // Сброс формы через antd и очистка локального состояния
      form.resetFields();
      setMatchData({
        date: null,
        team1: null,
        team2: null,
        map: '',
        score: '',
        winner: null,
      });
    } catch (error) {
      console.error('Ошибка при создании матча:', error);
      messageApi.error('Произошла ошибка при создании матча');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Родительский блок по центру экрана
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
      {contextHolder}
      <div style={{ width: '95%', maxWidth: '1200px' }}>
        <div style={{ background: '#f0f2f5', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
          <h2>Шаг 1: Создать матч</h2>
          {loadingTeams ? (
            <Spin />
          ) : (
            <Form layout="vertical" form={form}>
              <Form.Item label="Дата матча" required>
                <DatePicker
                  value={matchData.date}
                  onChange={(date) => handleMatchDataChange('date', date)}
                  style={{ width: '100%' }}
                  placeholder="Выберите дату"
                />
              </Form.Item>
              <Space style={{ display: 'flex', width: '100%' }} align="start">
                <Form.Item label="Команда 1" required style={{ flex: 1 }}>
                  <Select
                    value={matchData.team1}
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
                    value={matchData.team2}
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
                    value={matchData.map}
                    placeholder="Название карты"
                    onChange={(e) => handleMatchDataChange('map', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="Счет" required style={{ flex: 1 }}>
                  <Input
                    value={matchData.score}
                    placeholder="Например: 16-14"
                    onChange={(e) => handleMatchDataChange('score', e.target.value)}
                  />
                </Form.Item>
                <Form.Item label="Победитель" required style={{ flex: 1 }}>
                  <Select
                    value={matchData.winner}
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
              <Button type="primary" onClick={handleCreateMatch} loading={loading}>
                Создать матч
              </Button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMatch;
