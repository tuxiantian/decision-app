import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CustomMenu.css';

const MenuItem = ({ item, depth = 0 }) => {
  const hasChildren = item.children && item.children.length > 0;
  const navigate = useNavigate();

  const handleClick = (e, path) => {
    if (hasChildren) {
      e.preventDefault();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <li 
      className={`menu-item ${hasChildren ? 'has-children' : ''} depth-${depth}`}
    >
      {item.path ? (
        <Link 
          to={item.path} 
          className="menu-link"
          onClick={(e) => handleClick(e, item.path)}
        >
          {item.title}
          
        </Link>
      ) : (
        <span className="menu-link">
          {item.title}
          
        </span>
      )}
      
      {hasChildren && (
        <ul className={`sub-menu depth-${depth + 1}`}>
          {item.children.map((child, index) => (
            <MenuItem key={index} item={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const CustomMenu = ({ menuItems, username, onLogout }) => {
  return (
    <nav className="custom-menu">
      <ul className="menu-main">
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
        
        {username ? (
          <>
            <li className="menu-item user-info">
              <span className="menu-link">欢迎, {username}</span>
            </li>
            <li className="menu-item">
              <button className="menu-link logout-btn" onClick={onLogout}>
                退出
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="menu-item">
              <Link to="/login" className="menu-link">登陆</Link>
            </li>
            <li className="menu-item">
              <Link to="/register" className="menu-link">注册</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default CustomMenu;