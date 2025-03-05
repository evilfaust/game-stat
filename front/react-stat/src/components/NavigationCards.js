import React from 'react';
import { Layout, Card, Avatar, Row, Col, Button } from 'antd';
import { Link } from 'react-router-dom';

const { Meta } = Card;

const NavigationCardsStyled = () => {
  // Данные для карточек
  const cardData = [
    {
      key: 'home',
      title: 'Home',
      buttonText: 'перейти',
      description: 'Главная страница',
      link: '/',
      icon: '/images/icon032.png',
    },
    {
      key: 'senddata',
      title: 'Parse demo',
      buttonText: 'перейти',
      description: 'Создание матча и парсинг демок',
      link: '/senddata',
      icon: '/images/icon033.png',
    },
    {
      key: 'creatematch',
      title: 'Create match',
      buttonText: 'перейти',
      description: 'Отдельно создать матч',
      link: '/creatematch',
      icon: '/images/icon034.png',
    },
    {
      key: 'contact',
      title: 'Contact',
      buttonText: 'перейти',
      description: 'Связаться с нами',
      link: '/contact',
      icon: '/images/icon035.png',
    },
  ];

  return (
    <Layout>
      <Layout.Content>
        <Row
          gutter={[16, 16]}
          style={{
            marginTop: "20px",
            marginBottom: "20px",
            justifyContent: "center",
            alignItems: "stretch"
          }}
        >
          {cardData.map(card => (
            <Col
              xs={24}
              sm={12}
              md={8}
              lg={4}
              key={card.key}
              style={{ display: 'flex', alignItems: 'stretch' }}
            >
              <Card style={{ width: "98%", flex: 1 }}>
                <Meta
                  avatar={<Avatar shape="square" size={64} src={card.icon} />}
                  title={card.title}
                  description={
                    <>
                      <Link to={card.link}>
                        <Button color="purple" variant="filled" block>
                          {card.buttonText}
                        </Button>
                      </Link>
                      {card.description}
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Layout.Content>
    </Layout>
  );
};

export default NavigationCardsStyled;
