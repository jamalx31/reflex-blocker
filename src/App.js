import React, { useEffect } from 'react';
import { Layout, Slider, Card, Form, Input, Button, Checkbox, Divider, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import logo from './logo.svg';
import './App.css';

const { Header, Content, Footer } = Layout;


const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 24 },
};

function App() {

  const [form] = Form.useForm();

  useEffect(() => {
    /*eslint-disable no-undef*/

    chrome.storage.sync.get(['traps', 'target', 'timeWindow'], function (data) {
      /*eslint-enable no-undef*/
      console.log({ data })
      form.setFieldsValue({
        timeWindow: [420, 660],
        target: 'notion.so',
        traps: [''],
        ...data
      });
    })

  }, [])

  const onFinish = values => {
    /*eslint-disable no-undef*/

    chrome.storage.sync.set({ ...values }, function () {
      /*eslint-enable no-undef*/

    })

    console.log('Success:', values);
  };

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Layout className="layout" style={{ height: '100vh' }}>
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center' }}>
        <div>
          <Card
            title="Muscle Redirect - Stop your fingers from taking you to the wrong website"
            bordered={false}
            style={{ width: '100%', maxWidth: 1200 }}
          >
            <Form
              form={form}
              {...layout}
              name="basic"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
            >
              <Form.Item
                shouldUpdate
                label={`Time window`}
                name="timeWindow"
              >
                <Slider
                  tipFormatter={(v) => `${('0' + Math.floor(v / 60)).substr(-2)}:${('0' + v % 60).substr(-2)}`}
                  marks={{ 0: '00:00', 180: '03:00', 360: '06:00', 540: '09:00', 720: '12:00', 900: '15:00', 1080: '18:00', 1260: '21:00' }}
                  step={5}
                  min={0}
                  max={1440}
                  range
                  disabled={false} />
              </Form.Item>

              <Divider />

              <Row >
                <Col span={12} style={{ paddingRight: 30 }}>
                  {/* list of websites */}
                  <Form.List name="traps">
                    {(fields, { add, remove }) => {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {fields.map((field, index) => (
                            <Form.Item
                              label={index === 0 ? 'Traps' : ''}
                              required={false}
                              key={field.key}
                            // style={{ margin: 0 }}
                            >

                              {/* website link */}
                              <div style={{ display: 'flex' }}>

                                <Form.Item
                                  {...field}
                                  validateTrigger={['onChange', 'onBlur']}
                                  rules={[
                                    {
                                      required: true,
                                      whitespace: true,
                                      message: "Please input website's url or delete this field.",
                                    },
                                  ]}
                                  noStyle
                                >
                                  <Input placeholder="twitter.com" style={{ flex: 1 }} />
                                </Form.Item>

                                {/* delete row */}
                                {fields.length > 1 ? (
                                  <MinusCircleOutlined
                                    className="dynamic-delete-button"
                                    style={{ margin: '0 8px', alignSelf: 'center' }}
                                    onClick={() => {
                                      remove(field.name);
                                    }}
                                  />
                                ) : null}
                              </div>
                            </Form.Item>
                          ))}

                          {/* add new website */}
                          <Form.Item noStyle>
                            <Button
                              style={{ flex: 1, marginBottom: 24 }}
                              type="dashed"
                              onClick={() => {
                                add();
                              }}
                            >
                              <PlusOutlined /> Add new website
                          </Button>
                          </Form.Item>
                        </div>
                      );
                    }}
                  </Form.List>
                </Col>

                {/* 2nd COL */}
                <Col span={12} >
                  {/* redirect to */}
                  <Form.Item
                    label="Redirect to"
                    name="target"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item noStyle>
                <Button type="primary" htmlType="submit">
                  Save
              </Button>
              </Form.Item>
            </Form>

          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', fontWeight: 'bold' }}>
        Find me on Twitter <a href="https://twitter.com/jamalx31" target="_black">
          <img id="avatar" width="40" src="http://www.gravatar.com/avatar/80a954b59dcd03dc2e2b2487cab391c9" />
          {' '}jamalx31
          </a>
      </Footer>
    </Layout>
  );
}

export default App;
