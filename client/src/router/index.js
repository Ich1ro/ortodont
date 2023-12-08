import { createBrowserRouter } from 'react-router-dom';
import { Login, Main, Consultations, Profile } from '../pages';
import { AdminLogin, ClientLogin, AddOns, Discounts, Locations, PracticeInfo, Treatments, Users, Info, ResetPassword } from '../components';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <Main />,
		children: [
			{
				path: '/info',
				element: <Info />,
				children: [
					{
						path: '/info/practice-information',
						element: <PracticeInfo />
					},
					{
						path: '/info/treatments',
						element: <Treatments />
					},
					{
						path: '/info/add-ons',
						element: <AddOns />
					},
					{
						path: '/info/discounts',
						element: <Discounts />
					},
					{
						path: '/info/locations',
						element: <Locations />
					},
					{
						path: '/info/users',
						element: <Users />
					}
				]
			},
			{
				path: '/consultations',
				element: <Consultations />
			},
			{
				path: '/profile',
				element: <Profile />
			}
		]
	},
	{
		path: '/login',
		element: <Login />,
		children: [
			{
				path: '/login/admin',
				element: <AdminLogin />
			},
			{
				path: '/login/bp',
				element: <ClientLogin />
			},
			{
				path: '/login/reset',
				element: <ResetPassword />
			}
		]
	}
]);
