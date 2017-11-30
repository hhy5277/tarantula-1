'use strict';

const API_ROOT = "//lvh.me:3000/api"
const API_PROJECT_PATH = `${API_ROOT}/project`

function apiFetchProject(){
  return Vue.http.get(API_PROJECT_PATH, {responseType: 'json'}).then((r) => r.body)
}

function apiDeleteProject(id){
  return Vue.http.delete(`${API_PROJECT_PATH}/${id}`, {responseType: 'json'}).then((r) => r.body)
}
