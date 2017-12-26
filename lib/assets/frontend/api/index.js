'use strict';

const API_ROOT = `${window.location.origin}/api`
const API_PROJECT_PATH = `${API_ROOT}/project`
const API_NODE_PATH = `${API_ROOT}/node`

export function fetchProject(){
  return Vue.http.get(API_PROJECT_PATH, {responseType: 'json'}).then((r) => r.body)
}

export function deleteProject(id){
  return Vue.http.delete(`${API_PROJECT_PATH}/${id}`, {responseType: 'json'}).then((r) => r.body)
}

export function fetchProjectStats(id){
  return Vue.http.get(`${API_PROJECT_PATH}/${id}/stats`, {responseType: 'json'}).then((r) => r.body)
}

export function fetchProjectData(id){
  return Vue.http.get(`${API_PROJECT_PATH}/${id}/sample_data`, {responseType: 'json'}).then((r) => r.body)
}

export function postFeedback(data){
  return Vue.http.jsonp(`http://tarantula.tech/api/feedback`, {params: data}, {responseType: 'json'}).then((r) => r.body)
}

export function startProject(id){
  return Vue.http.post(`${API_PROJECT_PATH}/${id}/start`, {responseType: 'json'}).then((r) => r.body)
}

export function resetProject(id){
  return Vue.http.post(`${API_PROJECT_PATH}/${id}/reset`, {responseType: 'json'}).then((r) => r.body)
}

export function fetchProjectMessage(id){
  return Vue.http.post(`${API_PROJECT_PATH}/${id}/message`, {responseType: 'json'}).then((r) => r.body)
}

export function fetchNodes(){
  return Vue.http.get(`${API_NODE_PATH}`, {responseType: 'json'}).then((r) => r.body)
}
