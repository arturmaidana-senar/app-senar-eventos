import styled from 'styled-components/native';

export const Container = styled.KeyboardAvoidingView`
	flex: 1;
	background-color: #FFF; /* Cor de fundo semelhante à da imagem */
	padding: 20px;
`;

export const LogoSenar = styled.View`

`;

export const Button = styled.TouchableOpacity`
	background-color: #37C064;
	padding: 11px 64px;
	border-radius: 8px;
	justify-content: center;
	width: 100%;
	align-items: center;
	margin-bottom: 10px;
`;

export const ButtonText = styled.Text`
	color: #FFF;
	font-size: 16px;
`;


export const VersionText = styled.Text`
	color: #007C6F;
	font-size: 12px;
	position: absolute;
	bottom: 20px;
`;


export const CustomButton = styled.TouchableOpacity`
	flex-direction: row;
	align-items: flex-end;
`; 

export const SubmitButton = styled.TouchableOpacity`
	background-color: #37C064;
	padding: 11px 64px;
	border-radius: 8px;
	justify-content: center;
	width: 100%;
	align-items: center;
	margin-bottom: 10px;

`;

export const SubmitText = styled.Text`
	color: #FFF;
	font-size: 16px;
`;
