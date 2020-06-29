import React, { useEffect, useState } from 'react';
import { Layout, Slider, Card, Form, Input, Button, Switch, Divider, Row, Col, Modal, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import logo from './logo.svg';
import './App.css';

const { Header, Content, Footer } = Layout;


const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 24 },
};

function App() {

  const [form] = Form.useForm();
  const [canEdit, setCanEdit] = useState(true)
  const [countDown, setCountDown] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [paused, setPaused] = useState(false)


  useEffect(() => {
    let interval
    interval = setInterval(() => {
      /*eslint-disable no-undef*/
      chrome.storage.sync.get(['timeWindow'], function (data) {
        /*eslint-enable no-undef*/
        // console.log("TOOO")
        const timeWindow = data.timeWindow || [420, 660]
        var date = new Date();
        var now = date.getTime();
        const end = ((new Date()).setHours(0, 0, 0, 0)) + (timeWindow[1] * 60 * 1000)
        // console.log({ now, end })
        if (end >= now) {
          var distance = end - now;
          var hh = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          var mm = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          var ss = Math.floor((distance % (1000 * 60)) / 1000);
          setCountDown(`${hh}:${mm}:${ss}`)
        } else {
          setCountDown('')
        }

        var minutes = date.getMinutes();
        var hours = date.getHours();
        var result = (60 * hours) + minutes;


        setCanEdit(!(result >= timeWindow[0] && result <= timeWindow[1]))
      })
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [])

  useEffect(() => {
    /*eslint-disable no-undef*/

    chrome.storage.sync.get(['traps', 'target', 'timeWindow', 'revisitBlock', 'paused'], function (data) {
      /*eslint-enable no-undef*/
      setPaused(!!data.paused)
      form.setFieldsValue({
        timeWindow: [420, 660],
        target: 'notion.so',
        traps: [''],
        revisitBlock: true,
        ...data
      });
    })
  }, [])

  const onFinish = values => {
    /*eslint-disable no-undef*/

    chrome.storage.sync.set({
      ...values,
      target: values.target.replace(/(^\w+:|^)\/\//, ''),
      traps: values.traps.map(t => t.replace(/(^\w+:|^)\/\//, ''))
    }, function () {
      /*eslint-enable no-undef*/

    })

    // console.log('Success:', values);
  };

  const handlePause = () => {
    /*eslint-disable no-undef*/
    chrome.storage.sync.set({
      paused: !paused
    }, function () {
      /*eslint-enable no-undef*/
      setPaused(!paused)
    })
  }

  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Layout className="layout" style={{ height: '100vh' }}>
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center' }}>
        <div>
          <Card
            title="Reflex Blocker - Stop your fingers from taking you to the wrong website"
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
                label={`Focus Window`}
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
              <Form.Item
                label={<><span style={{ marginRight: 5 }}>Smart Block (beta)</span>
                  <Tooltip title="Out of your Focus Window range, Smart Block will help you avoide the traps by allwoing you to access them only once every 30 mins. So you don't close twitter now and open it again after 5 mins ¯\_(ツ)_/¯">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </>}
                name="revisitBlock"
                valuePropName="checked"
              >
                <Switch />
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
                {paused ?
                  <>
                    <Button type="primary" onClick={handlePause}>
                      Resume
                  </Button>
                    <Button style={{ marginLeft: 8 }}  htmlType="submit">
                      Save
                    </Button>
                  </>
                  :
                  <>
                    {
                      !countDown ?
                        <Button disabled={!canEdit} type="primary" htmlType="submit">
                          Save
                        </Button>
                        : <>
                          <>Your focus time ends in {countDown}</>
                          <Button type="link" onClick={() => setShowModal(true)}>
                            Pause
                      </Button>
                        </>
                    }
                  </>
                }
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

      <Modal
        title="Are you sure you want to waste your time?"
        visible={showModal}
        onOk={() => setShowModal(false)}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="back"
            onClick={() => {
              setShowModal(false)
              handlePause()
            }}
          >
            pause
          </Button>,
          <Button key="submit" type="primary" onClick={() => setShowModal(false)}>
            I will go back to work
          </Button>,
        ]}
      >
        <div style={{ width: '100%', textAlign: 'center' }}>
          <img src="https://i.gifer.com/RMp5.gif" />
        </div>
      </Modal>
    </Layout>
  );
}

export default App;
