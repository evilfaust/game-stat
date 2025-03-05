import React from 'react';
import { Card, Row, Col } from 'antd';
import { Link } from 'react-router-dom';

const cardData = [
  {
    key: 'home',
    title: 'Home',
    description: 'Перейти на главную страницу',
    link: '/',
  },
  {
    key: 'senddata',
    title: 'parse DEMO CS2',
    description: 'Создание матча и парсинг демо файла', 
    link: '/senddata',
  },
  {
    key: 'creatematch',
    title: 'creatematch',
    description: 'Узнать больше о нас',
    link: '/creatematch',
  },
  {
    key: 'contact',
    title: 'Contact',
    description: 'Связаться с нами',
    link: '/contact',
  },
  // можно добавить дополнительные карточки
];

const NavigationCards = () => {
  return (
    <Row gutter={[16, 16]} justify="center" style={{padding: '20px', borderRadius: '8px', marginBottom: '24px'}}>
      {cardData.map(card => (
        <Col key={card.key} xs={24} sm={12} md={8} lg={4}>
          <Link to={card.link}>
            <Card title={card.title} hoverable>
              {card.description}
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
};

export default NavigationCards;
