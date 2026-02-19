import styled from 'styled-components/native';

export const Container = styled.View`
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const InfoContainer = styled.View`
  flex: 1;
`;

export const Title = styled.Text`
  color: #37C064;
  font-family: Ubuntu;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 12px;
  margin-bottom: 4px;
`;

export const LocationContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

export const LocationText = styled.Text`
  margin-left: 8px;
  color: #333;
  font-family: Ubuntu;
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`;

export const DateStatusContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

export const DateContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const DateText = styled.Text`
  margin-left: 8px;
  color: #022723;
  font-family: Ubuntu;
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: 14px;
`;

export const StatusText = styled.Text`
  color: #007C6F;
  font-family: Ubuntu;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  line-height: 12px;
  text-transform: uppercase;
`;