'use strict';

const API_ROOT = "//lvh.me:3000/api"
const API_PROJECT_PATH = `${API_ROOT}/project`

function fetchProject(){
  return Vue.http.get(API_PROJECT_PATH, {responseType: 'json'}).then((r) => r.body)
}

function deleteProject(id){
  return Vue.http.delete(`${API_PROJECT_PATH}/${id}`, {responseType: 'json'}).then((r) => r.body)
}

function fetchProjectStats(id){
  return Vue.http.get(`${API_PROJECT_PATH}/${id}/stats`, {responseType: 'json'}).then((r) => r.body)
}
