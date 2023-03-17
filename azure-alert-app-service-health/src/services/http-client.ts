import { injectable } from 'inversify';
import axios, { AxiosRequestConfig } from 'axios';

@injectable()
export class HttpClient {

  public headers: Record<string, string> = {};

  public setHeaderJson(){
    this.headers['Content-Type'] = 'application/json';
    return this;
  }

  public async send(url: string, option?: AxiosRequestConfig) {
    return await axios({
      ...option,
      headers: this.headers,
      url,
      // 10 seconds
      timeout: 10000,
    });
  }

  public async post(url: string, option?: any) {
    return await this.send(url, {
      ...option,
      method: 'post'
    });
  }

  public async get(url: string, option?: AxiosRequestConfig) {
    return await this.send(url, {
      ...option,
      method: 'get'
    });
  }

}
