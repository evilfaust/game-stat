import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[location.pathname]}
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <Menu.Item key="/">
        <Link to="/">Home</Link>
      </Menu.Item>
      <Menu.Item key="/senddata">
        <Link to="/senddata">Parse demo</Link>
      </Menu.Item>
      {/* Дополнительные ссылки */}
      <Menu.Item key="/creatematch">
        <Link to="/creatematch">Create match</Link>
      </Menu.Item>
      <Menu.Item key="/contact">
        <Link to="/contact">Contact</Link>
      </Menu.Item>
    </Menu>
  );
};

export default Navbar;
