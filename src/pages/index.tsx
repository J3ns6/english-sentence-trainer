import { Main } from '~/components/Main';
import { NavBar } from '~/components/NavBar';
import React, { useState } from 'react';
import { Context } from '~/utils/context';
import { connectToDatabase } from '~/utils/mongodb';
import nookies from 'nookies';
const randomstring = require('randomstring');

export default function Home({ properties, cookie }: any): JSX.Element {
	const [languageMode, setLanguageMode] = useState('Random');
	const [questionLanguage, setQuestionLanguage] = useState('Ger');
	const [answerLanguage, setAnswerLangauge] = useState('En');

	const [textToTranslate, setTextToTranslate] = useState('');
	const [translationResult, setTranslationResult] = useState('');
	const [file, setFile] = useState([{ ger: '', en: '' }]);

	return (
		<div className="h-full w-full">
			<Context.Provider
				value={{
					languageMode,
					setLanguageMode,
					questionLanguage,
					setQuestionLanguage,
					answerLanguage,
					setAnswerLangauge,
					//text
					textToTranslate,
					setTextToTranslate,
					translationResult,
					setTranslationResult,
					file,
					setFile,
					properties,
					cookie,
				}}
			>
				<NavBar />
				<Main />
			</Context.Provider>
		</div>
	);
}

export async function getServerSideProps(ctx: {}) {
	const { db } = await connectToDatabase();

	const cookies = nookies.get(ctx);

	if (cookies['Cookie'].length === 0) {
		nookies.set(ctx, 'Cookie', randomstring.generate(), {
			path: '/',
		});
	}

	const cookie = cookies['Cookie'];

	console.log(cookie);

	const data = await db
		.collection('exercises')
		.find({})
		.sort({ $natural: -1 })
		.limit(3)
		.toArray();

	const properties = JSON.parse(JSON.stringify(data));

	const filtered = properties.map(
		(property: {
			_id: number;
			data: {
				letterEqual: string;
				translatedTextSplitted: string;
				translationResult: string;
			};
		}) => {
			const letterEqualArray = property.data.letterEqual.split(',');

			const letterEqualNumber = letterEqualArray.map((letter: string) => {
				return parseInt(letter);
			});

			const translatedTextSplitted =
				property.data.translatedTextSplitted.split(',');

			return {
				_id: property._id,
				letterEqual: letterEqualNumber,
				translationResult: property.data.translationResult,
				translatedTextSplitted: translatedTextSplitted,
			};
		},
	);

	return {
		props: { properties: filtered, cookie },
	};
}
