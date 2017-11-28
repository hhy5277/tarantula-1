# Tarantula

Tarantula是一个分布式爬虫框架。由中心服务器和节点服务器构成。

## 安装
`npm i -g tarantula`

## 服务器端
`tarantula server --port 3000`

## 客户端
`tarantula dispatch -s http://YOUR_SERVER:PORT`

## 开发者
`tarantula dev --project YOUR_PROJECT_NAME`

#### 发布代码到私有服务器
`tarantula publish -s http://YOUR_SERVER:PORT --name YOUR_PROJECT_NAME --description YOUR_DESCRIPTION --target YOUR_PROJECT_DIRECTORY`

#### 发布代码到官方服务器
`tarantula publish --name YOUR_PROJECT_NAME --description YOUR_DESCRIPTION --target YOUR_PROJECT_DIRECTORY`
