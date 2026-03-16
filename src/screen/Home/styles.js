// styled.js

import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: #f8f8f8;
`;

export const Header = styled.View`
  padding: 20px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
`;

export const Logo = styled.Image`
  width: 100px;
  height: 30px;
`;

export const Greeting = styled.Text`
  font-size: 18px;
  color: #000;
`;

export const MonthSelector = styled.ScrollView`
  flex-direction: row;
  padding: 10px 0;
  background-color: #f6f6f6;
  max-height: 80px;
`;

export const MonthButton = styled.TouchableOpacity`
  margin-right: 10px;
  padding: 10px;
  border-radius: 50px;
  height: 60px;
  width: 60px;
  align-items: center;
  justify-content: center;
  background-color: ${props => (props.active ? '#07814f' : '#E6E6E6')};
`;

export const MonthText = styled.Text`
  color: ${props => (props.active ? '#ffffff' : '#000')};
  font-size: 16px;
`;

export const EventosText = styled.Text`
  color: #454652;
  font-family: Ubuntu;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
`;

export const ProgramadosText = styled.Text`
  color: #7c7a80;
  font-family: Ubuntu;
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 15px;
  padding: 10px;
`;

export const Spacer = styled.View`
  width: 5px;
`;
