import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';
import '../../header/header.css';
import MyToast from '../../common/Toast';
import { ArrowArcLeft, ArrowClockwise, ArrowsClockwise, ArrowsLeftRight, ArrowSquareOut, BellSimple, Blueprint, Calendar, CaretDown, CaretRight, CashRegister, ChartBar, ChartPie, ChartPieSlice, Check, CheckCircle, Coin, Coins, CurrencyDollarSimple, DotsThreeOutline, DotsThreeVertical, EnvelopeSimple, EscalatorUp, Files, FloppyDisk, Gavel, Gear, GreaterThan, HandCoins, Info, LessThan, List, ListChecks, Pen, Phone, Plus, Receipt, ReceiptX, SignOut, TextStrikethrough, Trash, User, UserCirclePlus, UserFocus, UserMinus, UserRectangle, Users, Wallet, Warning, WarningCircle, Watch, X } from '@phosphor-icons/react';
import ExportDomAsFile from '../../common/exportDomAsFile/ExportDomAsFile';
import CurrencyText from '../../common/CurrencyText';
import LoadingIndicator from '../../LoadingIndicator';
import { cError, fncPlaceholder, formatDate, getDateHoursMinutes, normalizedLowercaseString, printDatesInterval } from '../../../scripts/myScripts';
import FormatedDate from '../../common/FormatedDate';
import FetchError from '../../common/FetchError';
import useCustomDialogs from '../../common/hooks/useCustomDialogs';
import ActionPrompt from '../../common/actionPrompt/ActionPrompt';
import ConfirmDialog from '../../common/confirmDialog/ConfirmDialog';
import NotFound from '../../common/NotFound';
import JsonJsFormatter from '../../common/JsonJsFormatter';
import EmptyBox from '../../common/EmptyBox';
import BarGraph from '../../chartJS/BarGraph';
import CountUp from 'react-countup'
import SystemSettings from '../../systemSettings/SystemSettings';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/zoom.css';
import { Menu, MenuItem, MenuButton, MenuDivider } from '@szhsin/react-menu';
import Popover from '@idui/react-popover';
import ContentToggler from '../../common/ContentToggler';
import DividerText from '../../common/DividerText';
import { BASE_URL, Axios } from '../../../api/api';
import { AuthContext } from '../../AuthProvider';
import RightFixedCard from '../../common/rightFixedCard/RightFixedCard';
import SmallLoader from '../../common/SmallLoader';
import NextStepInformer from '../../common/NextStepInformer';
import AbsoluteCloseButton from '../../common/AbsoluteCloseButton';
import ToogleButton from '../../common/ToogleButton';
import PersonAvatar from '../../common/PersonAvatar';
import SearchBar from '../../common/SearchBar';
import Overlay from '../../common/Overlay';
import SectionDescription from '../../common/SectionDescription';
import LoanStatusTable from '../../common/LoanStatusTable';
import CapitalStatusTable from '../../common/CapitalStatusTable';
import PenaltyStatusTable from '../../common/PenaltyStatusTable';
import CapitalStatusList from '../../common/CapitalStatusList';

const Admin = () => {

	const navigate = useNavigate();

	// Custom hooks
	const {
		// Toast
		showToast,
		toastMessage,
		toastType,
		toastSelfClose,
		toastSelfCloseTimeout,
		toast,
		successToast,
		warningToast,
		messageToast,
		resetToast,

		// Confirm Dialog
		showConfirmDialog,
		confirmDialogMessage,
		confirmDialogAction,
		confirmDialogActionText,
		confirmDialogCloseText,
		confirmDialogCloseCallback,
		confirmDialogType,
		confirmDialogActionWaiting,
		setConfirmDialogActionWaiting,
		customConfirmDialog,
		resetConfirmDialog,

		// Prompt
		showPrompt,
		promptMessage,
		promptType,
		promptInputType,
		promptSelectInputOptions,
		promptInputValue,
		promptInputPlaceholder,
		promptAction,
		promptActionWaiting,
		setPromptActionWaiting,
		customPrompt,
		resetPrompt,
	} = useCustomDialogs();

	const { loading, userType, logout } = useContext(AuthContext);

	const sideNavbarRef = useRef();
	const sideNavbarTogglerRef = useRef();
	const [sideNavbarIsFloated, setSideNavbarIsFloated] = useState(false);

	// Hide navbar
	const hideSideNavbar = useCallback(() => {
		if (sideNavbarIsFloated) {
			sideNavbarRef.current.classList.add('flyOutT');
			setTimeout(() => {
				setSideNavbarIsFloated(false); // Close navbar
				sideNavbarRef.current.classList.remove('flyOutT');
			}, 400);
		}
	}, [sideNavbarIsFloated]);

	// Handle clicks outside the navbar
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (sideNavbarRef.current && sideNavbarTogglerRef.current) {
				if (
					!sideNavbarRef.current.contains(e.target) &&
					!sideNavbarTogglerRef.current.contains(e.target)
				) {
					hideSideNavbar(); // Attempt to hide navbar
				}
			}
		};

		// Attach "click outside" event listener
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside); // Clean up
		};
	}, [hideSideNavbar]);

	/**
	 * Data
	*/

	/**
	 * Database
	 */

	const handelExportDatabase = async () => {
		try {
			setIsWaitingFetchAction(true);

			const response = await Axios.post(`/api/database/backup`);

			// Successful fetch
			const data = response.data;
			successToast({ message: data.message, selfClose: false });

		} catch (error) {
			setErrorWithFetchAction(error.message);

			// Handle API errors properly
			let errorMessage = "An error occurred while creating the database backup.";

			if (error.response) {
				// Server responded with a status code outside 2xx range
				console.error("API Error Response:", error.response.data);
				errorMessage = error.response.data.message || errorMessage;
			} else if (error.request) {
				// Request was made but no response received
				console.error("No response from API:", error.request);
				errorMessage = "No response from server. Please try again.";
			} else {
				// Something else happened
				console.error("Error creating BD backup:", error.message);
				errorMessage = error.message;
			}

			warningToast({ message: errorMessage });

		} finally {
			setIsWaitingFetchAction(false);
		}
	};

	/**
	 * Settings
	 */

	const [allSettings, setAllSettings] = useState([]);
	const [loadingSettings, setLoadingSettings] = useState(false);
	const [errorLoadingSettings, setErrorLoadingSettings] = useState(false);

	// Fetch settings
	const fetchSettings = async () => {
		try {
			setLoadingSettings(true);
			const response = await Axios.get(`/api/settings/system/all`);
			const data = response.data;
			setAllSettings(data);
			setErrorLoadingSettings(null);
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load settings. Please try again.";
			warningToast({ message: errorMessage });
			console.error("Error fetching settings:", error);
		} finally {
			setLoadingSettings(false);
		}
	};

	useEffect(() => {
		fetchSettings();
	}, []);

	// Extract settings data

	const [retrievedData, setRetrievedData] = useState({});

	useEffect(() => {
		if (allSettings.settingsData) {
			setRetrievedData(JSON.parse(allSettings?.settingsData));
		}
	}, [allSettings]);

	const sysSettings = useMemo(() => (
		retrievedData?.system
	), [retrievedData])

	const membersSettings = useMemo(() => (
		retrievedData?.members
	), [retrievedData])

	const savingsSettings = useMemo(() => (
		retrievedData?.savings
	), [retrievedData])

	const expensesSettings = useMemo(() => (
		retrievedData?.expenses
	), [retrievedData])

	const creditsSettings = useMemo(() => (
		retrievedData?.credits
	), [retrievedData])

	// Members settings

	const memberRoles = useMemo(() => membersSettings?.roles || [], [membersSettings]);

	const [roleSettings, setRoleSettings] = useState(memberRoles || []);

	// Credits settings

	const creditPrimaryInterest = useMemo(() => {
		return creditsSettings?.interests
			.find(t => t.type === 'primary')?.rate
	}, [creditsSettings]);

	const creditSecondaryInterest = useMemo(() => {
		return creditsSettings?.interests
			.find(t => t.type === 'secondary')?.rate
	}, [creditsSettings]);

	const creditPrimaryInterestPercentage = useMemo(() => {
		return creditPrimaryInterest / 100
	}, [creditPrimaryInterest]);

	const creditSecondaryInterestPercentage = useMemo(() => {
		return creditSecondaryInterest / 100
	}, [creditSecondaryInterest]);

	const [creditSettings, setCreditSettings] = useState({
		interestPrimary: creditPrimaryInterest,
		interestSecondary: creditSecondaryInterest,
		penalty: 2,
	});

	// Savings settings

	const monthlySavingsDay = useMemo(() => {
		return savingsSettings?.monthlyDueDay
	}, [savingsSettings]);

	const unitShareValue = useMemo(() => {
		return savingsSettings?.types
			.find(t => t.type === 'cotisation')?.amount
	}, [savingsSettings]);

	const cotisationPenalty = useMemo(() => {
		return savingsSettings?.types
			.find(t => t.type === 'cotisation')?.delayPenaltyAmount
	}, [savingsSettings]);

	const [shareSettings, setShareSettings] = useState({
		valuePerShare: unitShareValue,
	});

	const [savingSettings, setSavingSettings] = useState({
		cotisation: true,
		social: true,
		dueDate: savingsSettings?.monthlyDueDay,
		delayPenalty: cotisationPenalty,
	});

	// Records settings

	const expenseTypes = useMemo(() => expensesSettings?.types || [], [expensesSettings]);

	/**
	 * Members
	 */

	const [allMembers, setAllMembers] = useState([]);
	const [membersToShow, setMembersToShow] = useState([]);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [errorLoadingMembers, setErrorLoadingMembers] = useState(false);

	const totalCotisation = allMembers.reduce((sum, m) => (sum + (m.shares * unitShareValue)), 0);
	const totalSocial = allMembers.reduce((sum, m) => sum + Number(m.social), 0);

	const accountantNames = useMemo(() => {
		const member = allMembers.find(m => (m.role === 'accountant'));
		return `${member?.husbandLastName} ${member?.husbandFirstName}`;
	}, [allMembers]);

	// Fetch members
	const fetchMembers = async () => {
		try {
			setLoadingMembers(true);
			const response = await Axios.get(`/users`);
			const data = response.data;
			setAllMembers(data);
			setMembersToShow(data);
			setErrorLoadingMembers(null);
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load members. Please try again.";
			setErrorWithFetchAction(errorMessage);
			warningToast({ message: errorMessage });
			console.error("Error fetching members:", error);
		} finally {
			setLoadingMembers(false);
		}
	};

	useEffect(() => {
		fetchMembers();
	}, []);

	const activeMembers = useMemo(() => (
		allMembers.filter(m => (m.status !== 'removed' && m.status !== 'inactive'))
	), [allMembers]);

	const activeAndInactiveMembers = useMemo(() => (
		allMembers.filter(m => m.status !== 'removed')
	), [allMembers]);

	const totalMembers = useMemo(() => {
		return allMembers.length;
	}, [allMembers]);

	const totalActiveMembers = useMemo(() => {
		return activeMembers.length;
	}, [activeMembers]);


	// Members statistics
	const [menCount, setMenCount] = useState(0);
	const [womenCount, setWomenCount] = useState(0);

	const membersChartData = useMemo(() => {
		if (totalMembers > 0) {
			setMenCount(allMembers.filter(member => member?.husbandFirstName !== null).length);
			setWomenCount(allMembers.filter(member => ![null, 'N', 'N/A', 'NA'].includes(member?.wifeFirstName)).length);

			return {
				labels: ['Men', 'Women'],
				datasets: [
					{
						label: 'Total Number',
						data: [menCount, womenCount],
						borderColor: ['rgba(106, 142, 35, 1)', 'rgba(219, 29, 213, 1)'],
						backgroundColor: ['rgba(106, 142, 35, 0.5)', 'rgba(219, 29, 213, 0.5)'],
						borderWidth: 1,
					},
				],
				hoverOffset: 5,
			};
		}
	}, [allMembers, totalMembers, menCount, womenCount]);

	/**
	 * Figures
	 */

	const [allFigures, setAllFigures] = useState({});
	const [loadingFigures, setLoadingFigures] = useState(false);
	const [errorLoadingFigures, setErrorLoadingFigures] = useState(false);

	// Fetch figures
	const fetchFigures = async () => {
		try {
			setLoadingFigures(true);
			const response = await Axios.get(`/figures`);
			const data = response.data;
			setAllFigures(data);
			setErrorLoadingFigures(null);
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load figures. Please try again.";
			setErrorWithFetchAction(errorMessage);
			setErrorLoadingFigures(errorMessage);
			warningToast({ message: errorMessage });
			console.error("Error fetching figures:", error);
		} finally {
			setLoadingFigures(false);
		}
	};

	useEffect(() => {
		fetchFigures();
	}, []);

	/**
	 * Credits
	 */

	const [allCredits, setAllCredits] = useState([]);
	const [creditsToShow, setCreditsToShow] = useState([]);
	const [loadingCredits, setLoadingCredits] = useState(false);
	const [errorLoadingCredits, setErrorLoadingCredits] = useState(false);

	// Fetch credits
	const fetchCredits = async () => {
		try {
			setLoadingCredits(true);
			const response = await Axios.get(`/credits`);
			const data = response.data;
			setAllCredits(data);
			setCreditsToShow(data);
			setErrorLoadingCredits(null);
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load credits. Please try again.";
			setErrorWithFetchAction(errorMessage);
			setErrorLoadingCredits(errorMessage);
			warningToast({ message: errorMessage });
			console.error("Error fetching credits:", error);
		} finally {
			setLoadingCredits(false);
		}
	};

	useEffect(() => {
		fetchCredits();
	}, []);

	/**
	 * Loans
	 */

	const [allLoans, setAllLoans] = useState([]);
	const [loansToShow, setLoansToShow] = useState(allLoans);
	const [loadingLoans, setLoadingLoans] = useState(false);
	const [errorLoadingLoans, setErrorLoadingLoans] = useState(false);

	// Fetch loans
	const fetchLoans = async () => {
		try {
			setLoadingLoans(true);
			const response = await Axios.get(`/loans`);
			const data = response.data;
			setAllLoans(data);
			setLoansToShow(data);
			setErrorLoadingLoans(null);
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load loans. Please try again.";
			setErrorWithFetchAction(errorMessage);
			setErrorLoadingLoans(errorMessage);
			warningToast({ message: errorMessage });
			console.error("Error fetching loans:", error);
		} finally {
			setLoadingLoans(false);
		}
	};

	useEffect(() => {
		fetchLoans();
	}, []);

	const totalPaidInterest = allLoans.reduce((sum, loan) => sum + Number(loan.interestPaid), 0);

	const currentPeriodPaidInterest = totalPaidInterest
		- allMembers.reduce((sum, m) => sum + Number(m.distributedInterestPaid), 0);

	const interestToReceive =
		currentPeriodPaidInterest
		+ allMembers.reduce((sum, m) => sum + Number(m.initialInterest), 0);

	const pendingInterest = useMemo(() => (
		allLoans.reduce((sum, loan) => sum + loan.interestPending, 0)
	), [allLoans]);

	// Bar graph data
	// __Graph's UI states
	const [creditsBarGraphIndexAxis, setCreditsBarGraphIndexAxis] = useState(window.innerWidth >= 576 ? 'x' : 'y');
	const [creditsBarGraphMinHeight, setCreditsBarGraphMinHeight] = useState(window.innerWidth >= 576 ? '70vh' : '100vh');

	useEffect(() => {
		const handleResize = () => {
			setCreditsBarGraphIndexAxis(window.innerWidth >= 576 ? 'x' : 'y');
			setCreditsBarGraphMinHeight(window.innerWidth >= 576 ? '70vh' : '100vh');
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const membersCreditsStatsData = useMemo(() => {
		if (loansToShow.length > 0 && totalMembers > 0) {
			const membersPrimaryData = allMembers.map(m => ({
				id: m.id,
				fName: m.husbandFirstName,
				abrevShortName: `${m.husbandFirstName.slice(0, 1)}. ${m.husbandLastName}`,
			}));

			let creditsStats = membersPrimaryData.map(item => {
				const correspondingLoan = loansToShow.find(ln => ln.memberId === item.id);

				return {
					...item,
					loanTaken: correspondingLoan?.loanTaken || 0,
					loanPaid: correspondingLoan?.loanPaid || 0,
					interestTaken: correspondingLoan?.interestTaken || 0,
					interestPaid: correspondingLoan?.interestPaid || 0,
				};
			});

			return {
				labels: creditsBarGraphIndexAxis === 'y' ?
					creditsStats.map(item => item.fName)
					: creditsStats.map(item => item.abrevShortName), // Member names
				datasets: [
					{
						label: 'Loan Taken',
						data: creditsStats.map(item => item.loanTaken),
						backgroundColor: 'rgba(121, 121, 121, 0.75)',
					},
					{
						label: 'Loan Paid',
						data: creditsStats.map(item => item.loanPaid),
						backgroundColor: 'rgba(106, 142, 35, 0.75)',
					},
					{
						label: 'Interest Taken',
						data: creditsStats.map(item => item.interestTaken),
						backgroundColor: 'rgba(255, 99, 132, 0.75)',
					},
					{
						label: 'Interest Paid',
						data: creditsStats.map(item => item.interestPaid),
						backgroundColor: 'rgba(29, 155, 240, 0.75)',
					},
				],
				hoverOffset: 5,
			};
		}
		return null; // Return null if no data
	}, [allMembers, totalMembers, loansToShow, creditsBarGraphIndexAxis]);

	// __Graph's options
	const membersCreditsStatsOptions = useRef();
	membersCreditsStatsOptions.current = {
		indexAxis: creditsBarGraphIndexAxis, // Dynamically set based on screen width
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				beginAtZero: true,
				title: {
					display: true,
					text: creditsBarGraphIndexAxis === 'y' ? "Amount (RWF)" : "Members",
					font: {
						size: 14,
						weight: "bold",
					},
					padding: 10,
				},
			},
			y: {
				title: {
					display: true,
					text: creditsBarGraphIndexAxis === 'x' ? "Amount (RWF)" : "Members",
					font: {
						size: 14,
						weight: "bold",
					},
					padding: 10,
				},
			},
		},
		plugins: {
			title: {
				display: true,
				text: 'Credits statistics',
				font: {
					size: 18,
					weight: 'bold',
				},
				padding: {
					top: 10,
					bottom: 20,
				},
			},
		},
	};

	/**
	 * Records
	 */

	const [allRecords, setAllRecords] = useState([]);
	const [recordsToShow, setRecordsToShow] = useState(allRecords);
	const [loadingRecords, setLoadingRecords] = useState(false);
	const [errorLoadingRecords, setErrorLoadingRecords] = useState(false);

	// Fetch records
	const fetchRecords = async () => {
		try {
			setLoadingRecords(true);
			const response = await Axios.get(`/records`);
			const data = response.data;
			setAllRecords(data);
			setRecordsToShow(data);
			setErrorLoadingRecords(null);
		} catch (error) {
			const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load records. Please try again.";
			setErrorWithFetchAction(errorMessage);
			setErrorLoadingRecords(errorMessage);
			warningToast({ message: errorMessage });
			console.error("Error fetching records:", error);
		} finally {
			setLoadingRecords(false);
		}
	};

	useEffect(() => {
		fetchRecords();
	}, []);

	const totalExpenses = useMemo(() => (
		allRecords
			.filter(r => r.recordType === 'expense')
			.reduce((sum, r) => sum + Number(r.recordAmount), 0)
	), [allRecords]);

	/**
	 * Data refresh
	 */

	const refreshAllData = async () => {
		try {
			setIsWaitingFetchAction(true);
			await Promise.all([
				fetchMembers(),
				fetchFigures(),
				fetchCredits(),
				fetchLoans(),
				fetchRecords(),
				fetchSettings()
			]);

			messageToast({ message: 'Data refreshed', type: 'primaryColor', selfCloseTimeout: 2000 });
		} catch (error) {
			warningToast({ message: 'Failed to refresh some data. You can try again' });
			console.error('Error refreshing data:', error);
		} finally {
			setIsWaitingFetchAction(false);
		}
	};

	// Active UI section
	const [activeSection, setActiveSection] = useState("dashboard");
	// const [activeSection, setActiveSection] = useState("messages");
	// const [activeSection, setActiveSection] = useState("members");
	// const [activeSection, setActiveSection] = useState("savings");
	// const [activeSection, setActiveSection] = useState("credits");
	// const [activeSection, setActiveSection] = useState("interest");
	// const [activeSection, setActiveSection] = useState("transactions");
	// const [activeSection, setActiveSection] = useState("reports");
	// const [activeSection, setActiveSection] = useState("settings");
	// const [activeSection, setActiveSection] = useState("auditLogs");

	const [isWaitingFetchAction, setIsWaitingFetchAction] = useState(false);
	const [errorWithFetchAction, setErrorWithFetchAction] = useState(null);

	/**
	 * Sections
	 */

	// Dashboard
	const Dashboard = () => {

		const [showExportDataDialog, setShowExportDataDialog] = useState(false);
		const accountingDashboardRef = useRef();

		const totalLoanDisbursed = allFigures?.loanDisbursed
		const totalPaidCapital = allFigures?.paidCapital
		const totalPenalties = allFigures?.penalties
		const totalBalance = allFigures?.balance

		const dashboardDT = [
			{ label: 'Cotisation', value: totalCotisation, },
			{ label: 'Social', value: totalSocial, },
			{ label: 'Loan Delivered', value: totalLoanDisbursed, },
			{ label: 'Paid Interest', value: totalPaidInterest, },
			{ label: 'Pending Interest', value: pendingInterest, },
			{ label: 'Paid Capital', value: totalPaidCapital, },
			{ label: 'Penalties', value: totalPenalties, },
			{ label: 'Expenses', value: totalExpenses, },
			{ label: 'Balance', value: totalBalance, },
		]

		return (
			<>
				<div ref={accountingDashboardRef} className="container py-4 bg-bodi">
					<h2 className="mb-3 text-center text-uppercase text-primaryColor">Accounting Dashboard</h2>
					<div className='flex-align-center mb-3'>
						<hr className='flex-grow-1 my-0' />
						<CurrencyDollarSimple size={45} className='mx-2 p-2 text-gray-500 border border-2 border-secondary border-opacity-25 rounded-circle' />
						<hr className='flex-grow-1 my-0' />
					</div>
					{loadingFigures && (
						<div className="row gx-3 gy-4 gy-lg-3 pb-3 rounded-4 loading-skeleton">
							{Array.from({ length: 9 }).map((_, index) => (
								<div className="col-md-6 col-lg-4" key={index}>
									<div className="card bg-gray-400 py-3 border-0 rounded-0 h-100">
										<div className="card-body">
											<div className="h6 mb-4 p-3 fs-5 bg-gray-200"></div>
											<p className="p-2 bg-gray-200"></p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
					{!loadingFigures && errorLoadingFigures && (
						<FetchError
							errorMessage={errorLoadingFigures}
							refreshFunction={() => fetchFigures()}
							className="mb-5 mt-4"
						/>
					)}
					{!loadingFigures && !errorLoadingFigures && (
						<div className="row gx-3 gy-4 gy-lg-3 pb-3 rounded-4">
							{dashboardDT.map((item, index) => (
								<div className="col-md-6 col-lg-4" key={index}>
									<div className="card py-3 h-100 bg-transparent border-0 border-4 border-end rounded-0 border-primaryColor">
										<div className="card-body">
											<h6 className="card-title mb-4 fs-5 text-uppercase fw-bold text-gray-700">
												{item.label}
											</h6>
											<p className="card-text text-primaryColor">
												<CurrencyText amount={Number(item.value)} />
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
					<hr />
					<div>
						<p className='text'>
							Done on <FormatedDate date={new Date()} locale='en-CA' monthFormat='long' hour12Format={true} className="fw-semibold" /> by IKIMINA INGOBOKA Accountant, {accountantNames}.
						</p>
					</div>
				</div>
				<div className="text-center my-4">
					<button className="btn bg-primaryColor text-light rounded-0 clickDown"
						onClick={() => setShowExportDataDialog(true)}
					>
						<Files size={22} /> Generate Report
					</button>
				</div>

				{/* Export Accounting dashboard */}
				<ExportDomAsFile
					show={showExportDataDialog}
					container={accountingDashboardRef}
					exportName='Accounting dashboard'
					onClose={() => { setShowExportDataDialog(false) }}
				/>
			</>
		);
	}

	// Member
	const Members = () => {
		const [membersToShow, setMembersToShow] = useState(activeMembers);
		const [memberSearchValue, setMemberSearchValue] = useState('');
		const [showMemberStats, setShowMemberStats] = useState(false);

		// Search members
		const memberSearcherRef = useRef();

		const filterMembersBySearch = useCallback(() => {
			const searchString = normalizedLowercaseString(memberSearchValue).trim();

			if (searchString) {
				const filteredMembers = activeMembers.filter((val) => {
					return (
						(val.husbandFirstName &&
							normalizedLowercaseString(val.husbandFirstName)
								.includes(searchString)) ||
						(val.husbandLastName &&
							normalizedLowercaseString(val.husbandLastName)
								.includes(searchString)) ||
						(val.wifeFirstName &&
							normalizedLowercaseString(val.wifeFirstName)
								.includes(searchString)) ||
						(val.wifeLastName &&
							normalizedLowercaseString(val.wifeLastName)
								.includes(searchString)) ||
						(val.husbandEmail &&
							val.husbandEmail.toLowerCase().includes(searchString)) ||
						(val.wifeEmail &&
							val.wifeEmail.toLowerCase().includes(searchString)) ||
						(val.husbandPhone &&
							val.husbandPhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString)) ||
						(val.wifePhone &&
							val.wifePhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString))
					);
				});

				setMembersToShow(filteredMembers);
			}
		}, [memberSearchValue]);

		const resetMembers = () => {
			setMembersToShow(activeMembers);
		}

		// Reset members
		useEffect(() => {
			if (memberSearchValue === '') {
				resetMembers();
			}
		}, [memberSearchValue]);

		// Show info
		const [showMemberInfo, setShowMemberInfo] = useState(false);
		const [showPrimaryMemberInfo, setShowPrimaryMemberInfo] = useState(true);

		useEffect(() => {
			if (!showMemberInfo) {
				setEditSelectedmemberImage(false);
			}

		}, [showMemberInfo]);


		// Registration
		const [showAddMemberForm, setShowAddMemberForm] = useState(false);

		const [formData, setFormData] = useState({
			role: '',
			username: '',
			husbandFirstName: '',
			husbandLastName: '',
			husbandPhone: '',
			husbandEmail: '',
			wifeFirstName: '',
			wifeLastName: '',
			wifePhone: '',
			wifeEmail: '',
		});

		const resetRegistrationForm = () => {
			setFormData({
				role: '',
				username: '',
				husbandFirstName: '',
				husbandLastName: '',
				husbandPhone: '',
				husbandEmail: '',
				wifeFirstName: '',
				wifeLastName: '',
				wifePhone: '',
				wifeEmail: '',
			});
			setAutoGeneratePassword(true);
		};

		const [showWifeDetails, setShowWifeDetails] = useState(false);
		const [autoGeneratePassword, setAutoGeneratePassword] = useState(false);
		const [registrationPassword, setRegistrationPassword] = useState('');

		const handleChange = (e) => {
			const { name, value } = e.target;
			setFormData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		};

		useEffect(() => {
			if (autoGeneratePassword) {
				setRegistrationPassword('');
			}
		}, [autoGeneratePassword]);

		// Validate registration
		const [emailTaken, setEmailTaken] = useState(false);
		const [usernameTaken, setUsernameTaken] = useState(false);
		const [phoneNumberTaken, setPhoneNumberTaken] = useState(false);
		const [canRegisterNewMember, setCanRegisterNewMember] = useState(false);

		// Check for unique data
		useEffect(() => {
			const emailExists = allMembers.some(m =>
				m.husbandEmail === formData.husbandEmail ||
				m.husbandEmail === formData.wifeEmail ||
				m.wifeEmail === formData.wifeEmail ||
				m.wifeEmail === formData.husbandEmail
			);

			const usernameExists = allMembers.some(m =>
				normalizedLowercaseString(m.username) === normalizedLowercaseString(formData.username)
			);

			const phoneNumberExists = allMembers.some(m =>
				m.husbandPhone === formData.husbandPhone ||
				m.husbandPhone === formData.wifePhone ||
				m.wifePhone === formData.wifePhone ||
				m.wifePhone === formData.husbandPhone
			);

			// Only update states if values change (prevents redundant re-renders)
			setEmailTaken(prev => (prev !== emailExists ? emailExists : prev));
			setUsernameTaken(prev => (prev !== usernameExists ? usernameExists : prev));
			setPhoneNumberTaken(prev => (prev !== phoneNumberExists ? phoneNumberExists : prev));
		}, [formData]);

		// Allow or block registration
		useEffect(() => {
			setCanRegisterNewMember(!(emailTaken || usernameTaken || phoneNumberTaken));
		}, [emailTaken, usernameTaken, phoneNumberTaken]);

		// Handle registration
		const handleRegisterNewMember = async (e) => {
			if (e) e.preventDefault();

			const payload = {
				...formData,
				password: registrationPassword,
				autoGeneratePassword,
			};

			try {
				setIsWaitingFetchAction(true);
				const response = await Axios.post(`/users/register`, payload);
				// Successfull fetch
				const data = response.data;
				successToast({ message: `Success: ${data.message}` });
				resetRegistrationForm();
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchLoans();
			} catch (error) {
				const errorMessage = error.response?.data?.error || error.response?.data?.message || "Registration failed";
				setErrorWithFetchAction(errorMessage);
				warningToast({ message: errorMessage });
				cError('Registration error:', error.response?.data || error.message);
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// Edit member data
		const [showEditMemberForm, setShowEditMemberForm] = useState(false);
		const [selectedMember, setSelectedMember] = useState(activeMembers[0]);
		const [editHeadOfFamily, setEditHeadOfFamily] = useState(true);

		const [editSelectedmemberRole, setEditSelectedmemberRole] = useState('');
		const [editSelectedmemberUsername, setEditSelectedmemberUsername] = useState('');
		const [editSelectedmemberFName, setEditSelectedmemberFName] = useState('');
		const [editSelectedmemberLName, setEditSelectedmemberLName] = useState('');
		const [editSelectedmemberPhone, setEditSelectedmemberPhone] = useState('');
		const [editSelectedmemberEmail, setEditSelectedmemberEmail] = useState('');
		const [editSelectedmemberImage, setEditSelectedmemberImage] = useState(false);

		// Togger member editor
		useEffect(() => {
			if (showEditMemberForm && selectedMember) {
				setEditSelectedmemberRole(selectedMember?.role);
			} else {
				setEditSelectedmemberRole(selectedMember?.role || '');
			}
		}, [showEditMemberForm, selectedMember]);

		useEffect(() => {
			if (selectedMember) {
				setEditSelectedmemberUsername(selectedMember?.username);
				if (editHeadOfFamily) {
					setEditSelectedmemberFName(selectedMember?.husbandFirstName);
					setEditSelectedmemberLName(selectedMember?.husbandLastName);
					setEditSelectedmemberPhone(selectedMember?.husbandPhone);
					setEditSelectedmemberEmail(selectedMember?.husbandEmail);
				} else {
					setEditSelectedmemberFName(selectedMember?.wifeFirstName || '');
					setEditSelectedmemberLName(selectedMember?.wifeLastName || '');
					setEditSelectedmemberPhone(selectedMember?.wifePhone || '');
					setEditSelectedmemberEmail(selectedMember?.wifeEmail || '');
				}
			}
		}, [selectedMember, editHeadOfFamily, showEditMemberForm]);

		// Edit member image/avatar 
		const [imageFile, setImageFile] = useState(null);
		const [imageFileName, setImageFileName] = useState(null);

		const handleImageFileChange = (e) => {
			const file = e.target.files[0];
			if (file && !file.type.startsWith("image/")) {
				messageToast({ message: "Please upload valid image file." });
				return;
			}
			setImageFile(file);
			setImageFileName(file?.name || ""); // Set the file name
		};

		// Handle edit member photo/avatar
		const handleEditMemberAvatar = async (id, type, file) => {
			if (!file) {
				return warningToast({ message: "Select an image to continue." });
			}

			const formData = new FormData();
			formData.append('file', file);

			try {
				setIsWaitingFetchAction(true);
				const response = await Axios.post(`/user/${id}/edit-${type}-photo`, formData);
				// Successfull fetch
				const data = response.data;
				successToast({ message: data.message });
				setEditSelectedmemberImage(false);
				setImageFile(null);
				setImageFileName(null);
				setErrorWithFetchAction(null);
				fetchMembers();
			} catch (error) {
				const errorMessage = error.response?.data?.error || error.response?.data?.message || "Couldn't update the profile image. Tyr again";
				setErrorWithFetchAction(errorMessage);
				warningToast({ message: errorMessage, selfClose: false });
				cError('Error updating profile image:', error.response?.data || error.message);
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// Handle edit member info
		const handleEditMemberInfo = async (id, type) => {

			const memberInfo = type === 'husband' ? {
				role: editSelectedmemberRole,
				username: editSelectedmemberUsername,
				husbandFirstName: editSelectedmemberFName,
				husbandLastName: editSelectedmemberLName,
				husbandPhone: editSelectedmemberPhone,
				husbandEmail: editSelectedmemberEmail
			} : type === 'wife' ? {
				wifeFirstName: editSelectedmemberFName,
				wifeLastName: editSelectedmemberLName,
				wifePhone: editSelectedmemberPhone,
				wifeEmail: editSelectedmemberEmail
			} : null;

			if (memberInfo === null) {
				return warningToast({ message: 'Please select a member to edit and continue', type: 'gray-800' })
			}

			// Prevent empty string value
			if (Object.values(memberInfo).some(value => value === '')) {
				return warningToast({ message: 'Please fill out all information to continue', type: 'gray-800' })
			}

			try {
				setIsWaitingFetchAction(true);
				const response = await Axios.post(`/user/${id}/edit-${type}-info`, memberInfo);
				// Successfull fetch
				const data = response.data;
				successToast({ message: data.message });
				setShowEditMemberForm(false);
				setErrorWithFetchAction(null);
				fetchMembers();
			} catch (error) {
				const errorMessage = error.response?.data?.error || error.response?.data?.message || "Couldn't save changes. Tyr again";
				setErrorWithFetchAction(errorMessage);
				warningToast({ message: errorMessage })
				cError('Error saving changes:', error.response?.data || error.message);
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// Member financial overview and member removal 
		const [showMemberFinances, setShowMemberFinances] = useState(false);
		const [showMemberRemoval, setShowMemberRemoval] = useState(false);
		const hideMemberFinances = () => {
			setShowMemberFinances(false);
			setShowMemberRemoval(false);
		}

		const handleRemoveMember = async (email) => {
			try {
				setIsWaitingFetchAction(true);
				const response = await Axios.post(`/user/remove`, { email });

				// Successfull fetch
				const data = response.data;
				successToast({ message: data.message, selfClose: false });
				hideMemberFinances();
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchLoans();
				fetchFigures();
			} catch (error) {
				const errorMessage = error.response?.data?.error || error.response?.data?.message || "Couldn't remove this member";
				setErrorWithFetchAction(errorMessage);
				warningToast({ message: errorMessage });
				cError('Error removing member:', error.response?.data || error.message);
			} finally {
				setIsWaitingFetchAction(false);
				resetConfirmDialog();
			}
		};

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
					<h2 className='text-appColor'><Users weight='fill' className="me-1 opacity-50" /> Members</h2>
					<div className="ms-auto d-flex gap-1">
						<ToogleButton icon={<ChartBar />} text={<span className='d-none d-sm-inline'> Statistics</span>} func={() => setShowMemberStats(!showMemberStats)} />
						<ToogleButton icon={<Plus />} text='New member' func={() => setShowAddMemberForm(true)} />
					</div>
				</div>

				{showMemberStats && (
					<div className={`collapsible-grid-y ${showMemberStats ? 'working' : ''}`} style={{ animation: "zoomInBack .5s 1", }}>
						<div className="row mb-3 collapsing-content statistics-wrapper">
							<div className="col-12 col-lg-6">
								<BarGraph data={membersChartData} title='Members statistics' />
							</div>
							<div className="col-12 col-lg-6 alert mb-4 rounded-0 smaller fw-light">
								<p>
									Simple statistics of the members registered in Ikimina Ingoboka system
								</p>
								<div className="d-flex align-items-end gap-4 text-gray-600">
									<div className="position-relative flex-shrink-0 flex-center h-7rem px-3 fw-bold border border-3 border-secondary border-opacity-25 text-primaryColor rounded-pill" style={{ minWidth: '7rem' }}>
										<span className="display-1 fw-bold"><CountUp end={totalActiveMembers} /> </span> <small className='position-absolute start-50 bottom-0 border border-2 px-2 rounded-pill bg-light'>accounts</small>
									</div>
									<ul className="list-unstyled d-flex flex-wrap row-gap-1 column-gap-3 fs-6">
										<li className='border-start border-dark border-opacity-50 ps-2'>
											<b>Total men</b>: <CountUp end={menCount} />
										</li>
										<li className='border-start border-dark border-opacity-50 ps-2'>
											<b>Total women</b>: <CountUp end={womenCount} />
										</li>
										<li className='border-start border-dark border-opacity-50 ps-2'>
											<b>Total members</b>: <CountUp end={menCount + womenCount} />
										</li>
									</ul>
								</div>
							</div>
						</div>
						<CaretDown size={45} className='p-2 fw-light d-block mx-auto mb-5 text-primaryColor' style={{ animation: "flyInTop 2s 1" }} />
					</div>
				)}

				<div className="members-wrapper">
					{loadingMembers && (<LoadingIndicator icon={<Users size={80} className="loading-skeleton" />} />)}
					{!loadingMembers && errorLoadingMembers && (
						<FetchError
							errorMessage={errorLoadingMembers}
							refreshFunction={() => fetchMembers()}
							className="mb-5 mt-4"
						/>
					)}
					{!loadingMembers && !errorLoadingMembers && !membersToShow.length && (
						<NotFound
							notFoundMessage="No member found"
							icon={<Users size={80} className="text-center w-100 mb-3 opacity-50" />}
							refreshFunction={resetMembers}
						/>
					)}
					{!loadingMembers && !errorLoadingMembers && membersToShow.length && (
						<>
							{/* Search bar */}
							<SearchBar
								placeholder='🔍 Search members...'
								value={memberSearchValue}
								setValue={setMemberSearchValue}
								search={filterMembersBySearch}
								clearSearchValue={() => setMemberSearchValue('')}
								className="sticky-top col-lg-6 col-xxl-4 members-search-box"
								reference={memberSearcherRef}
							/>
							{/* Content */}
							{membersToShow
								.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
								.map((member, index) => (
									<div className="position-relative mb-3 my-5 px-2 pt-5 border-top border-3 border-secondary border-opacity-25 text-gray-700 member-element"
										key={index}
									>
										<div className="position-absolute top-0 me-3 d-flex gap-3"
											style={{ right: 0, translate: "0 -50%" }}
										>
											<PersonAvatar
												type='man'
												data={member}
												size='5rem'
												className='ptr'
												onClick={() => { setSelectedMember(member); setShowMemberInfo(true); setShowPrimaryMemberInfo(true) }}
											/>
											<PersonAvatar
												type='woman'
												data={member}
												size='5rem'
												className='ptr'
												onClick={() => {
													if (member?.wifeFirstName === null) {
														messageToast({ message: "No information available", selfCloseTimeout: 2000 })
													} else {
														setSelectedMember(member); setShowMemberInfo(true); setShowPrimaryMemberInfo(false);
													}
												}}
											/>
										</div>

										<div className="position-absolute top-0 start-0 ms-3 translate-middle-y flex-align-center gap-2">
											<Menu menuButton={
												<MenuButton className="btn btn-sm bg-gray-300 text-700 flex-align-center">
													<CaretDown className="me-1" /> More
												</MenuButton>
											} transition>
												<MenuItem onClick={() => { setSelectedMember(member); setShowMemberFinances(true); }}>
													<Coins weight='fill' className="me-2 opacity-50" /> Finances
												</MenuItem>
												<MenuItem onClick={() => { setSelectedMember(member); setShowEditMemberForm(true); }}>
													<Pen weight='fill' className="me-2 opacity-50" /> Edit
												</MenuItem>
												<MenuDivider />
												<MenuItem className='text-danger'
													onClick={() => {
														if (member.role === 'accountant') {
															messageToast(
																{
																	message: <>
																		<div>
																			<h6 className='me-2 pt-1 pb-2 border-bottom border-light border-opacity-50'>
																				Cannot remove {member?.husbandFirstName}
																			</h6>
																			<p>
																				This member holds accountant privileges and cannot be removed. Please assign the role to another member before proceeding
																			</p>
																		</div>
																	</>,
																	type: 'primaryColor',
																	selfClose: false
																}
															);
														} else {
															setSelectedMember(member); setShowMemberFinances(true); setShowMemberRemoval(true);
														}
													}}
												>
													<UserMinus weight='fill' className="me-2 opacity-50" />Leaving
												</MenuItem>
											</Menu>
										</div>

										<div className="px-lg-2">
											<h5 className="mb-3 fs-4">{`${member?.husbandFirstName} ${member?.husbandLastName}`}</h5>
											<div className="d-lg-flex">
												<div className="col-lg-6">
													<h6 className="flex-align-center px-2 py-1 border-bottom border-2 text-primaryColor fw-bolder">
														<User className="me-1" /> Husband
													</h6>
													<ul className="list-unstyled text-gray-700 px-2 smaller">
														<li className="py-1">
															<b>Names:</b> {`${member?.husbandFirstName} ${member?.husbandLastName}`}
														</li>
														<li className="py-1">
															<b>Phone:</b> <a href={`tel:+${member?.husbandPhone}`} className='text-decoration-none text-inherit' title={`Call ${member?.husbandFirstName}`}>{member?.husbandPhone}</a>
														</li>
														<li className="py-1">
															<b>Email:</b> <a href={`mailto:${member?.husbandEmail}`} className='text-decoration-none text-inherit' title={`Send email to ${member?.husbandFirstName}`}>{member?.husbandEmail}</a>
														</li>
													</ul>
												</div>
												<div className="col-lg-6 px-lg-2">
													{!member?.wifeFirstName ? (
														<div className="h-100 p-3 border border-2 border-top-0 rounded-0 flex-center">
															<button className="btn text-primaryColor fw-semibold rounded-0 clickDown flex-center gap-2" onClick={() => { setSelectedMember(member); setShowEditMemberForm(true); setEditHeadOfFamily(false); }}>
																<Users /> Add a partner
															</button>
														</div>
													) : (
														<>
															<h6 className="flex-align-center px-2 py-1 border-bottom border-2 text-primaryColor fw-bolder">
																<User className="me-1" /> Wife
															</h6>
															<ul className="list-unstyled text-gray-700 px-2 smaller">
																<li className="py-1">
																	<b>Names:</b> {`${member?.wifeFirstName} ${member?.wifeLastName}`}
																</li>
																<li className="py-1">
																	<b>Phone:</b> {member?.wifePhone ? (
																		<a href={`tel:+${member?.wifePhone}`} className='text-decoration-none text-inherit' title={`Call ${member?.wifeFirstName}`}>{member?.wifePhone}</a>
																	) : 'Not provided'}
																</li>
																<li className="py-1">
																	<b>Email:</b>  {member?.wifeEmail ? (
																		<a href={`mailto:${member?.wifeEmail}`} className='text-decoration-none text-inherit' title={`Send email to ${member?.wifeFirstName}`}>{member?.wifeEmail}</a>

																	) : 'Not provided'}
																</li>
															</ul>
														</>
													)}
												</div>
											</div>
										</div>
									</div>
								))
							}

							{/* Member primary info preview */}
							<RightFixedCard
								show={showMemberInfo}
								onClose={() => setShowMemberInfo(false)}
								title="Personal information"
								icon={<UserRectangle size={20} weight="fill" className='text-gray-700' />}
								content={
									<>
										<div>
											<div className="position-relative w-fit mb-5" style={{ minWidth: '20rem' }}>
												<img src={showPrimaryMemberInfo ? (selectedMember?.husbandAvatar || '/images/man_avatar_image.jpg') : (selectedMember?.wifeAvatar || '/images/woman_avatar_image.jpg')}
													alt=""
													className="ratio-1-1 object-fit-cover rounded-3"
													style={{ maxWidth: '20rem', objectPosition: 'center 25%' }}
												/>
												<div className='dim-fit position-absolute start-100 bottom-0 mb-2 bg-light border rounded-pill ptr clickDown' title='Edit photo' style={{ translate: '-125% 0' }} onClick={() => setEditSelectedmemberImage(!editSelectedmemberImage)}>
													<Pen size={35} className='p-2' />
												</div>
												<div className="position-absolute start-50 top-100 translate-middle bg-light text-gray-700 py-1 px-3 rounded-2 text-nowrap smaller shadow-sm">
													{showPrimaryMemberInfo ? `${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName} ` : `${selectedMember?.wifeFirstName} ${selectedMember?.wifeLastName}`}
												</div>
												{editSelectedmemberImage && (
													<div className="position-absolute start-50 top-50 translate-middle col-11 bg-gray-400 text-gray-700 p-3 py-4 text-nowrap smaller shadow-sm" style={{ animation: 'zoomInBack .2s 1' }}>
														<AbsoluteCloseButton bg="gray-400" text="gray-700" onClose={() => setEditSelectedmemberImage(false)} />
														<div className="flex-align-center flex-wrap gap-2 mb-3">
															<input
																type="file"
																accept="image/jpeg, image/jpg, image/png, image/webp"
																name="propImage"
																id="propImage"
																className="form-control file-input"
																onChange={handleImageFileChange}
															/>
															<p className={`${imageFileName ? 'text-success' : ''} mb-0 px-2`}>{imageFileName || "No file chosen"}</p>
														</div>
														<button className="btn btn-sm btn-dark w-100 rounded-pill px-3"
															onClick={() => handleEditMemberAvatar(selectedMember?.id, showPrimaryMemberInfo ? 'husband' : 'wife', imageFile)}
														>
															Update image
														</button>
													</div>
												)}
											</div>
											<div className="d-flex gap-2 mb-3">
												<a href={`tel:+${showPrimaryMemberInfo ? selectedMember?.husbandPhone : selectedMember?.wifePhone}`} className="btn btn-sm btn-outline-secondary border px-3 border-secondary border-opacity-25 rounded-pill flex-align-center clickDown">
													<Phone className='me-2' /> Call
												</a>
												<a href={`mailto:${showPrimaryMemberInfo ? selectedMember?.husbandEmail : selectedMember?.wifeEmail}`} className="btn btn-sm btn-outline-secondary border px-3 border-secondary border-opacity-25 rounded-pill flex-align-center clickDown">
													<EnvelopeSimple className='me-2' /> Email
												</a>
											</div>

											{showPrimaryMemberInfo ? (
												<ul className="list-unstyled text-gray-700 px-2 small">
													<li className="py-1">
														<b>Phone:</b> <span>{selectedMember?.husbandPhone}</span>
													</li>
													<li className="py-1">
														<b>Email:</b> <span>{selectedMember?.husbandEmail}</span>
													</li>
												</ul>
											) : (
												<ul className="list-unstyled text-gray-700 px-2 small">
													<li className="py-1">
														<b>Phone:</b> {selectedMember?.wifePhone ? (
															<span>{selectedMember?.wifePhone}</span>
														) : 'Not provided'}
													</li>
													<li className="py-1">
														<b>Email:</b>  {selectedMember?.wifeEmail ? (
															<span>{selectedMember?.wifeEmail}</span>

														) : 'Not provided'}
													</li>
												</ul>
											)}
										</div>
									</>
								}
								fitWidth={true}
							/>

							{/* Registration */}
							{showAddMemberForm &&
								<>
									<Overlay
										isSmall={true}
										titleIcon={
											<Users weight='fill' />
										}
										titleText="Register a new member"
										onClose={() => setShowAddMemberForm(false)}
										onCloseTitle="Cancel"
										children={
											<>
												<NextStepInformer
													type='light'
													content="Enter primary details for the new member. You can update their financial details later."
													className='shadow'
												/>

												{/* The form */}
												<form onSubmit={handleRegisterNewMember} className="px-sm-2 pb-5">
													{/* Husband Details */}
													<div className="mb-3">
														<label htmlFor="role" className="form-label fw-semibold">Role</label>
														<select id="role" name="role" className="form-select"
															value={formData.role}
															onChange={handleChange}
															required>
															<option value="" disabled className='p-2 px-3 small text-gray-500'>Select role</option>
															{memberRoles
																.map((val, index) => (
																	<option key={index} value={val} className='p-2 px-3 small text-capitalize'>
																		{val}
																	</option>
																))
															}
														</select>
													</div>
													<div className="mb-3">
														<label htmlFor="husbandFirstName" className="form-label fw-semibold">First Name</label>
														<input
															type="text"
															className="form-control"
															id="husbandFirstName"
															name="husbandFirstName"
															value={formData.husbandFirstName}
															onChange={handleChange}
															placeholder="Eg: Mugabe"
															required
														/>
													</div>
													<div className="mb-3">
														<label htmlFor="husbandLastName" className="form-label fw-semibold">Last Name</label>
														<input
															type="text"
															className="form-control"
															id="husbandLastName"
															name="husbandLastName"
															value={formData.husbandLastName}
															onChange={handleChange}
															placeholder="Eg: Alain"
															required
														/>
													</div>
													<div className="mb-3">
														<label htmlFor="username" className="form-label fw-semibold">Username</label>
														<input
															type="text"
															className="form-control"
															id="username"
															name="username"
															value={formData.username}
															onChange={handleChange}
															placeholder="Enter username"
															required
														/>
														{usernameTaken && (
															<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller"><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Userame already taken</div>
														)}
													</div>
													<div className="mb-3">
														<label htmlFor="husbandPhone" className="form-label fw-semibold">Phone</label>
														<input
															type="text"
															className="form-control"
															id="husbandPhone"
															name="husbandPhone"
															value={formData.husbandPhone}
															onChange={handleChange}
															placeholder="Enter phone number"
															required
														/>
														{phoneNumberTaken && (
															<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller"><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Phone already used</div>
														)}
													</div>
													<div className="mb-3">
														<label htmlFor="husbandEmail" className="form-label fw-semibold">Email</label>
														<input
															type="email"
															className="form-control"
															id="husbandEmail"
															name="husbandEmail"
															value={formData.husbandEmail}
															onChange={handleChange}
															placeholder="Enter email"
															required
														/>
														{emailTaken && (
															<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller"><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Email already used</div>
														)}
													</div>

													{/* Password Fields */}
													<div className="mb-3 form-check">
														<input
															type="checkbox"
															className="form-check-input border-2 border-primary"
															id="autoGeneratePassword"
															checked={autoGeneratePassword}
															onChange={() => setAutoGeneratePassword(!autoGeneratePassword)}
														/>
														<label htmlFor="autoGeneratePassword" className="form-check-label">
															Auto-generate a strong password
														</label>
													</div>
													{!autoGeneratePassword && (
														<div className="mb-3">
															<label htmlFor="password" className="form-label fw-semibold">Password</label>
															<input type="password" className="form-control" id="password" placeholder="Enter password"
																value={registrationPassword}
																onChange={e => setRegistrationPassword(e.target.value)}
															/>
														</div>
													)}

													{/* Toggle Wife Details */}
													<div className="my-5 d-flex">
														<button
															type="button"
															className={`btn btn-sm btn-outline-${showWifeDetails ? 'danger' : 'secondary'} border-start-0 border-end-0 mx-auto rounded-0`}
															onClick={() => setShowWifeDetails(!showWifeDetails)}
														>
															{showWifeDetails ? 'Remove partner details' : 'Add partner details'}
														</button>
													</div>

													{/* Wife Details (optional) */}
													{showWifeDetails && (
														<>
															<div className="mb-3">
																<label htmlFor="wifeFirstName" className="form-label fw-semibold">Wife's First Name</label>
																<input
																	type="text"
																	className="form-control"
																	id="wifeFirstName"
																	name="wifeFirstName"
																	value={formData.wifeFirstName}
																	onChange={handleChange}
																	placeholder="Eg: Ingabire"
																/>
															</div>
															<div className="mb-3">
																<label htmlFor="wifeLastName" className="form-label fw-semibold">Wife's Last Name</label>
																<input
																	type="text"
																	className="form-control"
																	id="wifeLastName"
																	name="wifeLastName"
																	value={formData.wifeLastName}
																	onChange={handleChange}
																	placeholder="Eg: Laetitia"
																/>
															</div>
															<div className="mb-3">
																<label htmlFor="wifePhone" className="form-label fw-semibold">Wife's Phone</label>
																<input
																	type="text"
																	className="form-control"
																	id="wifePhone"
																	name="wifePhone"
																	value={formData.wifePhone}
																	onChange={handleChange}
																	placeholder="Enter phone number"
																/>
																{phoneNumberTaken && (
																	<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller"><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Phone already used</div>
																)}
															</div>
															<div className="mb-3">
																<label htmlFor="wifeEmail" className="form-label fw-semibold">Wife's Email</label>
																<input
																	type="email"
																	className="form-control"
																	id="wifeEmail"
																	name="wifeEmail"
																	value={formData.wifeEmail}
																	onChange={handleChange}
																	placeholder="Enter email"
																/>
															</div>
														</>
													)}

													{/* Submit Button */}
													<button
														type="submit"
														className="btn btn-sm btn-dark flex-center w-100 mt-3 py-2 px-4 rounded-pill"
														disabled={!canRegisterNewMember}
													>
														Register
													</button>
												</form>
											</>
										}
									/>
								</>
							}

							{/* Edit member */}
							{showEditMemberForm &&
								<>
									<Overlay
										isSmall={true}
										titleIcon={
											<Users weight='fill' />
										}
										titleText="Edit Member"
										onClose={() => setShowEditMemberForm(false)}
										children={
											<>
												<div className="mb-4">
													<NextStepInformer type='light' content="Select whose information to edit and continue." />
													<ul className="list-unstyled d-flex">
														<li className={`col-6 px-2 py-1 text-center small border-2 ${editHeadOfFamily ? 'border-bottom border-primaryColor text-primaryColor' : ''} ptr clickDown`}
															onClick={() => { setEditHeadOfFamily(true); }}
														>
															Husband
														</li>
														<li className={`col-6 px-2 py-1 text-center small border-2 ${!editHeadOfFamily ? 'border-bottom border-primaryColor text-primaryColor' : ''} ptr clickDown`}
															onClick={() => { setEditHeadOfFamily(false); }}
														>
															Wife
														</li>
													</ul>
												</div>

												<div className="flex-align-center gap-2 mb-3">
													<PersonAvatar
														type={editHeadOfFamily ? 'man' : 'woman'}
														data={selectedMember}
													/>
													<div className='fw-semibold smaller'>
														Edit {
															editHeadOfFamily ? (
																selectedMember?.husbandFirstName ? `${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}` : 'Not provided'
															) : (
																selectedMember?.wifeFirstName ? `${selectedMember?.wifeFirstName} ${selectedMember?.wifeLastName}` : 'wife/partner information'
															)
														}

													</div>
												</div>
												<hr />

												{/* The form */}
												<form onSubmit={(e) => e.preventDefault()} className="px-sm-2 pb-5">
													{/* Selected member info */}
													{editHeadOfFamily && (
														<div className="mb-3">
															<label htmlFor="role" className="form-label fw-semibold">Role</label>
															<select id="role" name="role" className="form-select"
																value={editSelectedmemberRole}
																onChange={e => setEditSelectedmemberRole(e.target.value)}
																required>
																<option value="" disabled className='p-2 px-3 small text-gray-500'>Select role</option>
																{memberRoles
																	.map((val, index) => (
																		<option key={index} value={val} className='p-2 px-3 small text-capitalize'>
																			{val}
																		</option>
																	))
																}
															</select>
														</div>
													)}
													<div className="mb-3">
														<label htmlFor="memberFirstName" className="form-label fw-semibold">First Name</label>
														<input
															type="text"
															className="form-control"
															id="memberFirstName"
															name="memberFirstName"
															value={editSelectedmemberFName}
															onChange={e => setEditSelectedmemberFName(e.target.value)}
															placeholder={`Eg: ${editHeadOfFamily ? 'Mugabe' : 'Ingabire'}`}
															required
														/>
													</div>
													<div className="mb-3">
														<label htmlFor="memberLastName" className="form-label fw-semibold">Last Name</label>
														<input
															type="text"
															className="form-control"
															id="memberLastName"
															name="memberLastName"
															value={editSelectedmemberLName}
															onChange={e => setEditSelectedmemberLName(e.target.value)}
															placeholder={`Eg: ${editHeadOfFamily ? 'Alain' : 'Laetitia'}`}
															required
														/>
													</div>
													{editHeadOfFamily && (
														<div className="mb-3">
															<label htmlFor="memberUsername" className="form-label fw-semibold">Username</label>
															<input
																type="text"
																className="form-control"
																id="memberUsername"
																name="memberUsername"
																value={editSelectedmemberUsername}
																onChange={e => setEditSelectedmemberUsername(e.target.value)}
																placeholder="Enter username"
																required
															/>
															{allMembers
																.find(m => (
																	m.id !== selectedMember?.id &&
																	normalizedLowercaseString(m.username) === normalizedLowercaseString(editSelectedmemberUsername)
																)) && (
																	<div className="form-text px-2 py-1 bg-danger-subtle rounded-bottom-3 smaller"><WarningCircle size={22} weight='fill' className='me-1 opacity-50' /> Userame already taken</div>
																)
															}
														</div>
													)}
													<div className="mb-3">
														<label htmlFor="memberPhone" className="form-label fw-semibold">Phone</label>
														<input
															type="text"
															className="form-control"
															id="memberPhone"
															name="memberPhone"
															value={editSelectedmemberPhone}
															onChange={e => setEditSelectedmemberPhone(e.target.value)}
															placeholder="Enter phone number"
															required
														/>
													</div>
													<div className="mb-3">
														<label htmlFor="memberEmail" className="form-label fw-semibold">Email</label>
														<input
															type="email"
															className="form-control"
															id="memberEmail"
															name="memberEmail"
															value={editSelectedmemberEmail}
															onChange={e => setEditSelectedmemberEmail(e.target.value)}
															placeholder="Enter email"
															required
														/>
													</div>
													<button type="submit" className="btn btn-sm btn-outline-dark flex-center w-100 py-2 px-4 rounded-pill clickDown" id="addSavingBtn"
														onClick={() => handleEditMemberInfo(selectedMember?.id, editHeadOfFamily ? 'husband' : 'wife')}
													>
														{!isWaitingFetchAction ?
															<>Save changes <FloppyDisk size={18} className='ms-2' /></>
															: <>Working <SmallLoader /></>
														}
													</button>
												</form>
											</>
										}
									/>
								</>
							}

							{/* Member Credits */}
							{showMemberFinances &&
								<>
									<Overlay
										titleIcon={
											<PersonAvatar type='man' data={selectedMember} className='flex-shrink-0' />
										}
										titleText={
											<>
												{!showMemberRemoval ? 'Finances of' : 'Remove'} {`${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}`}
											</>
										}
										onClose={() => hideMemberFinances()}
										children={
											<>
												<div className="d-sm-flex mb-3">
													<div className="position-relative flex-shrink-0 flex-center w-fit h-7rem px-4 fw-bold border border-3 border-secondary border-opacity-25 text-primaryColor rounded-pill" style={{ minWidth: '7rem' }}>
														<span className="display-3 fw-bold"><CountUp end={selectedMember?.shares} duration={0.6} /> </span> <small className='position-absolute start-50 bottom-0 border border-2 px-2 rounded-pill bg-light'>shares</small>
													</div>
													<div className='px-sm-3 py-3 smaller text-gray-700 fw-light'>
														Below is the financial status of {`${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}`}, as recorded in the IKIMINA INGOBOKA saving management system. This status includes the total personal capital, comprising cotisation and social contributions, along with their credit status.
													</div>
												</div>

												{showMemberRemoval && (
													<div className="mb-4 p-3 border rounded-4 small shadow-sm">
														<div className='mb-2 text-danger-emphasis'>
															<p className='text-center'>
																Members are removed or deactivated according to their financial status. <span className='text-primary fw-semibold text-nowrap ptr clickDown' data-bs-toggle="collapse" data-bs-target="#readMore-member-removal-info">Read more</span>
															</p>
															<p className="p-3 bg-info-subtle rounded text-gray-700 collapse" id='readMore-member-removal-info'>
																If cotisation exceeds credit, the credit is cleared, and the remaining balance is retained. If credit exceeds the cotisation, the cotisation is deducted, and the member remains under credits records.
															</p>
														</div>
														<CaretDown size={35} weight='light' className='p-2 d-block mx-auto' />
													</div>
												)}

												<div className="d-xl-flex gap-3">
													{/* Cotisation and social */}
													<div className='col col-xl-5 mb-5'>
														<div className="fs-6 fw-semibold text-primaryColor text-center text-uppercase">Cotisation and social</div>
														<hr />
														<CapitalStatusTable memberData={selectedMember} />
													</div>
													{/* Loan status */}
													<div className="col mb-5 mb-xl-0">
														<div className="fs-6 fw-semibold text-primaryColor text-center text-uppercase">Loan status</div>
														<hr />
														{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0)).length ? (
															<>
																{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0))
																	.map((item, index) => {
																		const selectedLoan = item;
																		return (
																			<Fragment key={index} >
																				<LoanStatusTable loanData={selectedLoan} />
																			</Fragment>
																		)
																	})
																}
															</>
														) : (
															<>
																<EmptyBox
																	notFoundMessage={`No credit records found for this member.`}
																/>
															</>
														)}
													</div>
												</div>

												{!showMemberRemoval && (
													<div className="mb-lg-4">
														<div className="fs-6 fw-semibold text-primaryColor text-center text-uppercase">Penalties</div>
														<hr />
														{allRecords
															.filter(cr =>
																(cr.recordType === 'penalty' && cr.memberId === selectedMember?.id)
															).length ? (
															<PenaltyStatusTable records={allRecords} members={allMembers} selectedMember={selectedMember} />
														) : (
															<EmptyBox
																notFoundMessage={`No penalties applied on this member.`}
															/>
														)}
													</div>
												)}

												{/* Remove action */}
												{showMemberRemoval && (
													<>
														<DividerText text={<><UserMinus size={22} weight='fill' className='me-1 opacity-50' /> Remove this member</>} type='danger' noBorder className="mb-4" />
														<div className="mb-3">
															<div className="mb-3 pt-2 form-text bg-danger-subtle rounded">
																<p className='mb-2 px-2 text-danger-emphasis text-center smaller'>
																	This member will be removed or deactivated according to their financial status.
																</p>

																{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0)).length ? (
																	<>
																		{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0))
																			.map((item, index) => {
																				const selectedLoan = item;
																				const removeCompletely = (selectedMember?.cotisation + Number(selectedMember?.social)) > selectedLoan?.loanPending;
																				return (
																					<Fragment key={index} >
																						<div className='overflow-auto'>
																							<table className="table table-hover h-100 mb-0">
																								<thead className='table-warning position-sticky top-0 inx-1 1 text-uppercase small'>
																									<tr>
																										<th className='py-3 text-nowrap text-gray-700 fw-normal'>Cotisation</th>
																										<th className='py-3 text-nowrap text-gray-700 fw-normal'>
																											<div className="text-center">Comparison</div>
																										</th>
																										<th className='py-3 text-nowrap text-gray-700 fw-normal'>Pending Loan</th>
																									</tr>
																								</thead>
																								<tbody>
																									<tr>
																										<td className={`ps-sm-3 text-primary-emphasis`}>
																											<CurrencyText amount={selectedMember?.cotisation + Number(selectedMember?.social)} />
																										</td>
																										<td>
																											<div className="text-center">
																												{removeCompletely ? (
																													<GreaterThan size={25} />
																												) : (
																													<LessThan size={25} />
																												)}
																											</div>
																										</td>
																										<td className='text-warning-emphasis'>
																											<CurrencyText amount={selectedLoan?.loanPending} />
																										</td>
																									</tr>
																									<tr className="bg-transparent">
																										<td className={`ps-sm-3 border-bottom-3 border-end`}>
																											Decision
																										</td>
																										<td className='text-primary-emphasis small'>
																											<div className="flex-center gap-2">
																												{removeCompletely ? (
																													<span className="flex-align-center"><UserMinus size={22} weight='fill' className='me-1 opacity-50' /> Member is removed completely</span>
																												) : (
																													<span className="flex-align-center"><UserFocus size={22} weight='fill' className='me-1 opacity-50' /> Member stays under credit records</span>
																												)}
																											</div>
																										</td>
																										<td></td>
																									</tr>
																								</tbody>
																							</table>
																							<div className="d-flex">
																								<button className="col btn btn-sm text-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																									onClick={() => hideMemberFinances()}
																								>
																									Cancel
																								</button>
																								<button className="col btn btn-sm btn-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																									disabled={(isWaitingFetchAction)}
																									onClick={
																										() => {
																											customConfirmDialog({
																												message: (
																													<>
																														<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><UserMinus size={25} weight='fill' className='opacity-50' /> Removing a group member</h5>
																														<p className='fw-semibold'>
																															Are you sure to remove {`${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}`} from the system ?
																														</p>
																													</>
																												),
																												type: 'warning',
																												action: () => handleRemoveMember(selectedMember?.husbandEmail),
																											});
																										}
																									}
																								>
																									{!isWaitingFetchAction ?
																										<>Remove <UserMinus size={18} className='ms-2' /></>
																										: <>Working <SmallLoader color='light' /></>
																									}
																								</button>
																							</div>
																						</div>
																					</Fragment>
																				)
																			})
																		}
																	</>
																) : (
																	<div className="alert">
																		<p>
																			<b>Decision: <UserMinus size={22} weight='fill' className='me-1 opacity-50' /> Removed completely</b>. A member with no credit records can withdraw their cotisation (if any) and will be removed from the active system members.
																		</p>
																		<div className="d-flex">
																			<button className="col btn btn-sm text-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																				onClick={() => hideMemberFinances()}
																			>
																				Cancel
																			</button>
																			<button className="col btn btn-sm btn-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																				disabled={(isWaitingFetchAction)}
																				onClick={
																					() => {
																						customConfirmDialog({
																							message: (
																								<>
																									<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><UserMinus size={25} weight='fill' className='opacity-50' /> Removing a group member</h5>
																									<p className='fw-semibold'>
																										Are you sure to remove {`${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}`} from the system ?
																									</p>
																								</>
																							),
																							type: 'warning',
																							action: () => handleRemoveMember(selectedMember?.husbandEmail),
																						});
																					}
																				}
																			>
																				{!isWaitingFetchAction ?
																					<>Remove <UserMinus size={18} className='ms-2' /></>
																					: <>Working <SmallLoader color='light' /></>
																				}
																			</button>
																		</div>
																	</div>
																)}
															</div>
														</div>
													</>
												)}
											</>
										}
									/>
								</>
							}
						</>
					)}
				</div>
			</div>
		);
	}

	// Savings
	const Savings = () => {
		const [savingsToShow, setSavingsToShow] = useState(activeMembers);
		const [savingSearchValue, setSavingSearchValue] = useState('');

		// Search savings
		const savingSearcherRef = useRef();

		const filterSavingsBySearch = useCallback(() => {
			const searchString = savingSearchValue.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
			if (searchString !== null && searchString !== undefined && searchString !== '') {
				// showAllProperties(true);
				const filteredsavings = activeMembers.filter((val) => {
					return (
						(val.husbandFirstName &&
							normalizedLowercaseString(val.husbandFirstName)
								.includes(searchString)) ||
						(val.husbandLastName &&
							normalizedLowercaseString(val.husbandLastName)
								.includes(searchString)) ||
						(val.wifeFirstName &&
							normalizedLowercaseString(val.wifeFirstName)
								.includes(searchString)) ||
						(val.wifeLastName &&
							normalizedLowercaseString(val.wifeLastName)
								.includes(searchString)) ||
						(val.husbandEmail &&
							val.husbandEmail.toLowerCase().includes(searchString)) ||
						(val.wifeEmail &&
							val.wifeEmail.toLowerCase().includes(searchString)) ||
						(val.husbandPhone &&
							val.husbandPhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString)) ||
						(val.wifePhone &&
							val.wifePhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString))
					);
				});
				setSavingsToShow(filteredsavings);
			}
		}, [savingSearchValue]);

		const resetSavings = () => {
			setSavingsToShow(activeMembers);
		}

		// Reset savings
		useEffect(() => {
			if (savingSearchValue === '') {
				resetSavings();
			}
		}, [savingSearchValue]);

		// Add saving
		const [showAddSavingRecord, setShowAddSavingRecord] = useState(false);
		const [savingRecordType, setSavingRecordType] = useState('cotisation');
		const [selectedMember, setSelectedMember] = useState(activeMembers[0]);
		const [savingRecordAmount, setSavingRecordAmount] = useState('');
		const [selectedMonths, setSelectedMonths] = useState([]);
		const [applyDelayPenalties, setApplyDelayPenalties] = useState(false);

		// Month selection
		const checkIfLate = (month) => {
			const today = new Date();
			const currentYear = today.getFullYear();
			const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth();
			const month10thDate = new Date(currentYear, monthIndex, 10);
			return today > month10thDate;
		};

		const totalSelectedMonths = useMemo(() => (
			selectedMonths.length
		), [selectedMonths]);

		const delayedMonths = useMemo(() => (
			selectedMonths.filter(m => checkIfLate(m)).length
		), [selectedMonths]);

		const handleMonthClick = (month, isLate) => {
			setSelectedMonths((prevSelectedMonths) => {
				const isAlreadySelected = prevSelectedMonths.includes(month);

				let updatedMonths;
				if (isAlreadySelected) {
					// Remove the month if it's already selected
					updatedMonths = prevSelectedMonths.filter((m) => m !== month);
				} else {
					// Add the month if it's not already selected
					updatedMonths = [...prevSelectedMonths, month];
				}

				// Update the saving amount based on the selected months
				const totalAmount = updatedMonths.reduce((total, currentMonth) => {
					if (applyDelayPenalties) {
						const isCurrentLate = checkIfLate(currentMonth);
						return total + (isCurrentLate ? (unitShareValue + cotisationPenalty) : unitShareValue);
					} else {
						return total + unitShareValue;
					}
				}, 0);

				setSavingRecordAmount(totalAmount);
				return updatedMonths;
			});
		};

		// Handle add savings
		const handleAddSaving = async (id) => {
			if (!savingRecordAmount || Number(savingRecordAmount) <= 0) {
				return warningToast({ message: "Enter valid saving amount to continue" });
			}

			try {
				setIsWaitingFetchAction(true);

				const payload = savingRecordType === 'cotisation' ? {
					savings: selectedMonths,
					applyDelayPenalties,
					comment: savingRecordType[0].toUpperCase() + savingRecordType.slice(1) + ` (${selectedMonths.toString()})`
				} : savingRecordType === 'social' ? {
					savingAmount: savingRecordAmount,
					comment: savingRecordType[0].toUpperCase() + savingRecordType.slice(1)
				} : null;

				const response = await fetch(`${BASE_URL}/member/${id}/${savingRecordType}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error adding savings');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setShowAddSavingRecord(false);
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchFigures();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error adding savings:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// Add multiple shares (umuhigo)
		const [showAddMultipleShares, setShowAddMultipleShares] = useState(false);
		const [multipleSharesAmount, setMultipleSharesAmount] = useState('');
		const [newMemberSocial, setNewMemberSocial] = useState('');
		const [newMemberInterest, setNewMemberInterest] = useState('');
		const [updateNewMember, setUpdateNewMember] = useState(false);

		useEffect(() => {
			if (!updateNewMember) {
				setNewMemberSocial('');
				setNewMemberInterest('');
			}
		}, [updateNewMember]);

		// Handle add savings
		const handleAddMultipleShares = async (id) => {
			if (!updateNewMember) {
				if (!multipleSharesAmount || Number(multipleSharesAmount) <= 0) {
					return warningToast({ message: "Enter valid number of shares to continue" });
				}
			}

			const payload = updateNewMember ? {
				newMember: updateNewMember,
				progressiveShares: multipleSharesAmount,
				newMemberSocial,
				newMemberInterest,
				comment: `Adding ${multipleSharesAmount} shares (Umuhigo)`,

			} : {
				newMember: updateNewMember,
				progressiveShares: multipleSharesAmount,
				comment: `Adding ${multipleSharesAmount} shares (Umuhigo)`,
			}

			try {
				setIsWaitingFetchAction(true);

				const response = await fetch(`${BASE_URL}/member/${id}/multiple-shares`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error adding multiple shares');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setShowAddMultipleShares(false);
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchFigures();
				fetchRecords();
				fetchLoans();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error adding multiple shares:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<h2 className='text-appColor'><Coin weight='fill' className="me-1 opacity-50" /> Savings panel</h2>
					<SectionDescription
						imagePath='/images/savings_visual.png'
						content="Below is a comprehensive overview of each member's or family's savings balance, accompanied by the total number of shares they hold. This information provides a clear and organized view of individual contributions and associated ownership stakes, ensuring transparency and easy tracking of savings progress."
					/>
				</div>
				<hr className='mb-4 d-lg-none' />

				<div className="savings-wrapper">
					{loadingMembers && (<LoadingIndicator icon={<Coin size={80} className="loading-skeleton" />} />)}
					{!loadingMembers && errorLoadingMembers && (
						<FetchError
							errorMessage={errorLoadingMembers}
							refreshFunction={() => fetchMembers()}
							className="mb-5 mt-4"
						/>
					)}
					{!loadingMembers && !errorLoadingMembers && !savingsToShow.length && (
						<div className="col-sm-8 col-md-6 col-lg-5 col-xl-4 mx-auto my-5 p-3 rounded error-message">
							<img src="/images/fetch_error_image.jpg" alt="Error" className="w-4rem h-4rem mx-auto mb-2 opacity-50" />
							<p className="text-center text-muted small">
								No members found.
							</p>
							<button className="btn btn-sm btn-outline-secondary d-block border-0 rounded-pill mx-auto px-4" onClick={resetSavings}>
								<ArrowClockwise weight="bold" size={18} className="me-1" /> Refresh
							</button>
						</div>
					)}
					{!loadingMembers && !errorLoadingMembers && savingsToShow.length && (
						<>
							{/* Search bar */}
							<SearchBar
								placeholder='🔍 Search members...'
								value={savingSearchValue}
								setValue={setSavingSearchValue}
								search={filterSavingsBySearch}
								clearSearchValue={() => setSavingSearchValue('')}
								className="sticky-top col-lg-6 col-xxl-4 savings-search-box"
								reference={savingSearcherRef}
							/>
							{/* Content */}
							<div className="d-lg-flex flex-wrap pb-5">
								{savingsToShow
									.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
									.map((member, index) => {
										const { husbandFirstName, husbandLastName, shares, cotisation, social } = member;

										return (
											<div key={index} className='col-lg-6 px-lg-3'>
												<div className="position-relative mb-3 my-5 px-2 pt-5 border-top border-3 border-secondary border-opacity-25 text-gray-700 member-element"
												>
													<div className="position-absolute top-0 me-3 d-flex gap-3"
														style={{ right: 0, translate: "0 -50%" }}
													>
														<PersonAvatar type='man' data={member} size='5rem' />
													</div>
													<div className="px-lg-2">
														<h5 className="mb-3 fs-4">{`${husbandFirstName} ${husbandLastName}`}</h5>
														<CapitalStatusList
															memberData={member}
															actionButton={
																<Popover content="Multiple shares" trigger='hover' className='py-1 px-2 smaller shadow-none border border-secondary border-opacity-25' arrowColor='var(--bs-gray-400)' height='1.9rem'>
																	<span className='py-1 px-2 border border-top-0 border-bottom-0 text-primaryColor flex-align-center ptr clickDown'
																		onClick={() => { setSelectedMember(member); setShowAddMultipleShares(true) }}>
																		<EscalatorUp size={22} className='me-2' /> Umuhigo
																	</span>
																</Popover>
															}
														/>
														<button className="btn btn-sm text-primaryColor border-primaryColor w-100 flex-center rounded-0 clickDown"
															onClick={() => { setSelectedMember(member); setShowAddSavingRecord(true) }}
														><Plus className='me-1' /> Save amount</button>
													</div>
												</div>
											</div>
										)
									})
								}
							</div>

							{/* Record savings */}
							{showAddSavingRecord &&
								<>
									<Overlay
										isSmall={true}
										titleIcon={
											<CashRegister weight='fill' />
										}
										titleText="Add monthly savings"
										onClose={() => { setShowAddSavingRecord(false); setSavingRecordAmount('') }}
										onCloseTitle='Cancel'
										children={
											<>
												<div className="flex-align-center gap-2 mb-3">
													<PersonAvatar type='man' data={selectedMember} className='flex-shrink-0' />
													<div className='smaller'>
														Add savings for {selectedMember?.husbandFirstName} {selectedMember?.husbandLastName}
													</div>
												</div>
												<hr />

												{/* The form */}
												<form onSubmit={(e) => e.preventDefault()} className="px-sm-2 pb-5">
													<div className="mb-3">
														<p className="small">
															<b>Saving type</b>: <span className="text-primaryColor text-capitalize">{savingRecordType}</span>
														</p>
														<ul className="list-unstyled d-flex">
															<li className={`col-6 px-2 py-1 text-center small border-2 ${savingRecordType === 'cotisation' ? 'border-bottom border-primaryColor text-primaryColor' : ''} ptr clickDown`}
																onClick={() => setSavingRecordType('cotisation')}
															>
																Cotisation
															</li>
															<li className={`col-6 px-2 py-1 text-center small border-2 ${savingRecordType === 'social' ? 'border-bottom border-primaryColor text-primaryColor' : ''} ptr clickDown`}
																onClick={() => setSavingRecordType('social')}
															>
																Social
															</li>
														</ul>
													</div>

													{savingRecordType === 'cotisation' && (
														<>
															<div className="mb-3 form-check">
																<input
																	type="checkbox"
																	className="form-check-input border-2 border-primary"
																	id="autoGeneratePassword"
																	checked={applyDelayPenalties}
																	onChange={() => {
																		setApplyDelayPenalties(!applyDelayPenalties);
																		setSelectedMonths([]);
																		setSavingRecordAmount('');
																	}}
																/>
																<label htmlFor="autoGeneratePassword" className="form-check-label">
																	Apply delay penalties
																</label>
															</div>
															<div className="mb-3">
																<ul className="list-unstyled d-flex gap-2 flex-wrap">
																	{['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => {
																		const monthValue = JSON.parse(selectedMember?.annualShares).find((m) => m.month === month);
																		const isPaid = monthValue?.paid || false;
																		const isLate = !isPaid && checkIfLate(month);
																		const isSelected = selectedMonths.includes(month);

																		return (
																			<li
																				key={index}
																				onClick={() => {
																					if (!isPaid) handleMonthClick(month, isLate);
																				}}
																				className={`border border-2 rounded-pill px-2 smaller user-select-none ${isPaid ? 'ptr-none bg-gray-600 text-light' : 'ptr'} clickDown ${isSelected ? 'bg-primaryColor text-light' : ''
																					} ${applyDelayPenalties && isLate && !isPaid ? 'text-danger' : ''}`}
																			>
																				{isPaid && <Check />} {month}
																			</li>
																		);
																	})}
																</ul>
															</div>
														</>

													)}
													<div className="mb-3">
														<label htmlFor="savingAmount" className="form-label fw-bold" required>
															Saving amount ({savingRecordAmount !== '' ? Number(savingRecordAmount).toLocaleString() : ''} RWF) {savingRecordType === 'cotisation' && savingRecordAmount !== '' && savingRecordAmount !== 0 && (
																<>
																	= {totalSelectedMonths} Share{totalSelectedMonths > 1 ? 's' : ''}
																</>
															)}
														</label>
														<input
															type="number"
															id="savingAmount"
															name="savingAmount"
															className="form-control"
															min="1"
															required
															placeholder="Enter amount"
															readOnly={savingRecordType === 'cotisation'}
															value={savingRecordAmount}
															onChange={(e) => setSavingRecordAmount(e.target.value)}
														/>
													</div>
													{savingRecordType === 'cotisation' && applyDelayPenalties && delayedMonths > 0 && (
														<div className="mb-3 p-2 form-text bg-danger-subtle rounded">
															<p className='mb-2 small text-danger-emphasis'>
																This applies a fine of <CurrencyText amount={cotisationPenalty} /> for each of the delayed months.
															</p>
															<ul className="list-unstyled d-flex gap-2 flex-wrap mb-0 mb-0">
																{selectedMonths
																	.filter(m => checkIfLate(m))
																	.map((month, index) => (
																		<li
																			key={index}
																			className={`border border-2 border-light-subtle text-danger-emphasis rounded-pill px-2 smaller user-select-none`}
																		>
																			<Gavel /> {month}
																		</li>
																	))}
															</ul>
														</div>
													)}
													<div className="mt-4 p-2 form-text rounded">
														<p className='mb-2 small text-dark-emphasis text-center'>
															Please verify the details before saving
														</p>
														<button type="submit" className="btn btn-sm btn-outline-dark flex-center w-100 py-2 px-4 rounded-pill clickDown" id="addSavingBtn"
															onClick={() => handleAddSaving(selectedMember?.id)}
														>
															{!isWaitingFetchAction ?
																<>Save amount <FloppyDisk size={18} className='ms-2' /></>
																: <>Working <SmallLoader /></>
															}
														</button>
													</div>
												</form>
											</>
										}
									/>

								</>
							}

							{/* Record multiple shares */}
							{showAddMultipleShares &&
								<>
									<Overlay
										isSmall={true}
										titleIcon={
											<CashRegister weight='fill' />
										}
										titleText="Add multiple shares"
										onClose={() => { setShowAddMultipleShares(false); setMultipleSharesAmount(''); }}
										onCloseTitle='Cancel'
										children={
											<>
												<div className="flex-align-center gap-2 mb-3">
													<PersonAvatar type='man' data={selectedMember} className='flex-shrink-0' />
													<div className='smaller'>
														Save multiple shares to {selectedMember?.husbandFirstName} {selectedMember?.husbandLastName}
													</div>
												</div>
												<CapitalStatusList
													memberData={selectedMember}
													className="opacity-75"
												/>
												<DividerText text="Add new shares" type='gray-300' className="mb-4" />
												{/* The form */}
												<form onSubmit={(e) => e.preventDefault()} className="px-sm-2 pb-5">
													<div className="mb-3">
														<label htmlFor="savingAmount" className="form-label fw-bold" required>
															Number of shares ({multipleSharesAmount !== '' ? `${multipleSharesAmount} Share${multipleSharesAmount > 1 ? 's' : ''}` : ''}) {multipleSharesAmount !== '' && multipleSharesAmount !== 0 && (
																<>
																	= <CurrencyText amount={Number(multipleSharesAmount) * unitShareValue} />
																</>
															)}
														</label>
														<input
															type="number"
															id="savingAmount"
															name="savingAmount"
															className="form-control"
															min="1"
															required
															placeholder="Enter shares"
															value={multipleSharesAmount}
															onChange={(e) => setMultipleSharesAmount(e.target.value)}
														/>
														<div className="form-text text-info-emphasis fw-bold">Unit share value is <CurrencyText amount={unitShareValue} /> </div>
													</div>

													{/* Register new member */}
													<div className="mb-3 form-check">
														<input
															type="checkbox"
															className="form-check-input border-2 border-primary"
															id="autoGeneratePassword"
															checked={updateNewMember}
															onChange={() => setUpdateNewMember(!updateNewMember)}
														/>
														<label htmlFor="autoGeneratePassword" className="form-check-label">
															Updating new member
														</label>
													</div>
													{updateNewMember && (
														<>
															<div className="mb-3">
																<label htmlFor="newMemberinterest" className="form-label fw-semibold">Social ({newMemberSocial !== '' ? Number(newMemberSocial).toLocaleString() : ''} RWF)</label>
																<input type="number" className="form-control" id="password"
																	placeholder="Enter social amount"
																	value={newMemberSocial}
																	min="1"
																	onChange={e => setNewMemberSocial(e.target.value)}
																/>
															</div>
															<div className="mb-3">
																<label htmlFor="newMemberinterest" className="form-label fw-semibold">Interest ({newMemberInterest !== '' ? Number(newMemberInterest).toLocaleString() : ''} RWF)</label>
																<input type="number" className="form-control" id="newMemberinterest"
																	placeholder="Enter interest"
																	value={newMemberInterest}
																	min="1"
																	onChange={e => setNewMemberInterest(e.target.value)}
																/>
															</div>
														</>
													)}
													<div className="mt-4 p-2 form-text rounded">
														<p className='mb-2 small text-dark-emphasis text-center'>
															Please verify the details before saving
														</p>
														<button type="submit" className="btn btn-sm btn-outline-dark flex-center w-100 py-2 px-4 rounded-pill clickDown" id="addSavingBtn"
															onClick={() => handleAddMultipleShares(selectedMember?.id)}
														>
															{!isWaitingFetchAction ?
																<>Add shares <FloppyDisk size={18} className='ms-2' /></>
																: <>Working <SmallLoader /></>
															}
														</button>
													</div>
												</form>
											</>
										}
									/>
								</>
							}
						</>
					)}
				</div>
			</div>
		);
	}

	// Interest
	const Interest = () => {

		const [showExportDataDialog, setShowExportDataDialog] = useState(false);
		const interestPartitionViewRef = useRef();

		const totalProgressiveShares = activeMembers.reduce((sum, item) => sum + item.progressiveShares, 0);
		const totalActiveShares = activeMembers.reduce((sum, item) => {
			const paidAnnualShares = JSON.parse(item.annualShares).filter(share => share.paid).length;
			return sum + item.progressiveShares + paidAnnualShares;
		}, 0);

		let totalSharesPercentage = 0;
		let totalMonetaryInterest = 0;
		let totalInterestReceivable = 0;
		let totalSharesReceivable = 0;
		let totalInterestRemains = 0;
		let totalAnnualShares = 0;

		const [showShareAnnualInterest, setShowShareAnnualInterest] = useState(false);
		const [keepAnnualInterest, setKeepAnnualInterest] = useState(false);
		// Condition the dates for interest distribution
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const startCondition = new Date(`${currentYear}-12-26`); // 5 days before year end
		const endCondition = new Date(`${currentYear}-01-${monthlySavingsDay}`); // 10 days into next year
		const isWithinCondition = currentDate >= startCondition && currentDate <= endCondition;

		// Handle interest distribution
		const distributeAnnualInterest = async (id) => {
			if (window.confirm(`Are you sure to proceed with ${keepAnnualInterest ? 'keeping' : 'withdrawing'} the annual interest ?`)) {
				try {
					setIsWaitingFetchAction(true);
					const response = await Axios.post(`/api/${keepAnnualInterest ? 'distribute' : 'withdraw'}-interest`);
					// Successfull fetch
					const data = response.data;
					successToast({ message: data.message, selfClose: false });
					setShowShareAnnualInterest(false);
					setErrorWithFetchAction(null);
					fetchMembers();
					fetchFigures();
					fetchLoans();
					fetchCredits();
				} catch (error) {
					const errorMessage = error.response?.data?.error || error.response?.data?.message || "An unknown error occurred";
					setErrorWithFetchAction(errorMessage);
					warningToast({ message: errorMessage, selfClose: false });
					cError("Error distributing interest:", error);
				} finally {
					setIsWaitingFetchAction(false);
				}
			}
		}

		// Annual interes records
		const [allAnnualInterest, setAllAnnualInterest] = useState([]);
		const [annualInterestToShow, setAnnualInterestToShow] = useState(allAnnualInterest);
		const [loadingAnnualInterest, setLoadingAnnualInterest] = useState(false);
		const [errorLoadingAnnualInterest, setErrorLoadingAnnualInterest] = useState(false);

		const [selectedAnnualInterestRecord, setSelectedAnnualInterestRecord] = useState([]);
		const [showAnnualInterestRecords, setShowAnnualInterestRecords] = useState(false);
		const [showSelectedAnnualInterestRecord, setShowSelectedAnnualInterestRecord] = useState(false);

		const interestRecentYears = useMemo((() => (
			allAnnualInterest.length
		)), [allAnnualInterest]);

		// Fetch annaul interest records
		const fetchAnnualInterests = async () => {
			try {
				setLoadingAnnualInterest(true);
				const response = await Axios.get(`/api/annualInterests`);
				const data = response.data;
				setAllAnnualInterest(data);
				setAnnualInterestToShow(data);
				setErrorLoadingAnnualInterest(null);
			} catch (error) {
				const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to load annual interest records. Please try again.";
				setErrorWithFetchAction(errorMessage);
				setErrorLoadingAnnualInterest(errorMessage);
				warningToast({ message: errorMessage });
				console.error("Error fetching loans:", error);
			} finally {
				setLoadingAnnualInterest(false);
			}
		};

		useEffect(() => {
			fetchAnnualInterests();
		}, []);

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<h2 className='text-appColor'><Coins weight='fill' className="me-1 opacity-50" /> Interest panel</h2>
					<SectionDescription
						imagePath='/images/interests_visual.png'
						content="This panel provides an organized summary of interest earnings distributed to each member or family, based on their ownership shares. It ensures transparency by displaying individual share percentages, monetary interest amounts, and overall totals, offering members a clear understanding of their returns and fostering accountability."
					/>
				</div>
				<hr className='mb-4 d-lg-none' />
				<div ref={interestPartitionViewRef}>
					<div className="alert alert-success smaller">
						<p className='display-6'>
							Statut des intérêts annuels
						</p>
						<div className="d-flex flex-wrap gap-2 ms-lg-auto mb-2">
							<div className='col'>
								<div className='flex-align-center text-muted border-bottom'><ChartPie className='me-1 opacity-50' /> <span className="text-nowrap">All shares</span></div>
								<div className='text-center bg-bodi fs-6'>{totalActiveShares}</div>
							</div>
							<div className='col'>
								<div className='flex-align-center text-muted border-bottom'><Coins className='me-1 opacity-50' /> <span className="text-nowrap">Interest receivable</span></div>
								<div className='text-center bg-bodi fs-6'><CurrencyText amount={interestToReceive} /></div>
							</div>
						</div>
						<Calendar size={25} className='me-2' /> Année {new Date().getFullYear()}
					</div>
					<div className='overflow-auto mb-5'>
						<table className="table table-hover h-100">
							<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
								<tr>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>N°</th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Member</th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Shares <sub className='fs-60'>/Active</sub></th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Share % <sub className='fs-60'>to <b>{totalActiveShares}</b></sub></th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Interest <sub className='fs-60'>/RWF</sub></th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Receivable<sub className='fs-60'>/RWF</sub></th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Receivable<sub className='fs-60'>/Shares</sub></th>
									<th className='py-3 text-nowrap text-gray-700 fw-normal'>Remains<sub className='fs-60'>/RWF</sub></th>
								</tr>
							</thead>
							<tbody>
								{activeMembers.map((member, index) => {
									const memberNames = `${member?.husbandFirstName} ${member?.husbandLastName}`;
									const progressiveShares = member.progressiveShares;
									const paidAnnualShares = JSON.parse(member.annualShares).filter(share => share.paid).length;
									const activeShares = progressiveShares + paidAnnualShares;
									const sharesProportion = totalActiveShares > 0 ? activeShares / totalActiveShares : 0;
									const sharesPercentage = (sharesProportion * 100).toFixed(3);
									const activeinterest = currentPeriodPaidInterest * sharesProportion;
									const interest = activeinterest + Number(member.initialInterest);
									const interestReceivable = (Math.floor(interest / unitShareValue) * unitShareValue);
									const sharesReceivable = interestReceivable / unitShareValue;
									const interestRemains = interest - interestReceivable;

									totalSharesPercentage += Number(sharesPercentage);
									totalMonetaryInterest += Number(interest);
									totalInterestReceivable += interestReceivable;
									totalSharesReceivable += sharesReceivable;
									totalInterestRemains += interestRemains;

									return (
										<tr key={index} className="small cursor-default interest-row">
											<td className="border-bottom-3 border-end">{index + 1}</td>
											<td className='text-nowrap'>{memberNames}</td>
											<td>{activeShares}</td>
											<td className="text-nowrap">{sharesPercentage} %</td>
											<td className="text-nowrap text-gray-700">
												<CurrencyText amount={interest} smallCurrency />
											</td>
											<td className="text-nowrap text-success">
												<CurrencyText amount={interestReceivable} smallCurrency />
											</td>
											<td className="text-success">
												{sharesReceivable}
											</td>
											<td className="text-nowrap text-gray-700">
												<CurrencyText amount={interestRemains} smallCurrency />
											</td>
										</tr>
									);
								})}
								<tr className="small cursor-default fs-5 table-success clickDown interest-row">
									<td className="border-bottom-3 border-end" title='Total'>T</td>
									<td className='text-nowrap'>{totalMembers} <span className="fs-60">members</span></td>
									<td className='text-nowrap'>{totalActiveShares}</td>
									<td className="text-nowrap">{totalSharesPercentage.toFixed(3)} %</td>
									<td className="text-nowrap fw-semibold">
										<CurrencyText amount={totalMonetaryInterest} smallCurrency />
									</td>
									<td className="text-nowrap fw-semibold text-success">
										<CurrencyText amount={totalInterestReceivable} smallCurrency />
									</td>
									<td className="text-nowrap fw-semibold text-success">
										{totalSharesReceivable} <span className='fs-70 fw-normal'>shares</span>
									</td>
									<td className="text-nowrap">
										<CurrencyText amount={totalInterestRemains} smallCurrency />
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* Exporter */}
				<div className='small'>
					<div className="d-flex flex-wrap gap-2">
						<button className="btn btn-sm bg-primaryColor text-light rounded-0 clickDown"
							onClick={() => setShowExportDataDialog(true)}
						>
							<Files size={22} /> Generate Report
						</button>
						<p className='mb-0 p-2 smaller'>
							<Info className='me-1' />
							Click the button to generate selected year's interest partition status.
						</p>
					</div>
				</div>

				{/* Export report tables */}
				<ExportDomAsFile
					show={showExportDataDialog}
					container={interestPartitionViewRef}
					exportName={`Statut des intérêts annuels __ Année ${new Date().getFullYear()}`}
					onClose={() => { setShowExportDataDialog(false) }}
				/>

				{/* Share interest */}
				{/* {isWithinCondition && ( */}
				<ContentToggler
					state={showShareAnnualInterest}
					setState={setShowShareAnnualInterest}
					text="Share Annual Interest"
					className="ms-auto"
				/>
				{/* )} */}

				{showShareAnnualInterest && (
					<>
						{/* Share interest */}
						<div className="my-5">
							<h3 className="grid-center mb-4 text-primaryColor text-uppercase">
								<span className='d-block text-center'>Chose how to share the annual interest.</span>
								<CaretDown size={45} className='p-2 fw-light' />
							</h3>
							<ul className="list-unstyled d-flex gap-2">
								<li className={`col px-2 py-1 text-center small user-select-none ${!keepAnnualInterest ? 'bg-primaryColor text-gray-200' : 'border border-primaryColor text-primaryColor'} rounded-pill ptr clickDown`}
									onClick={() => { setKeepAnnualInterest(false); }}
								>
									Withdraw interest
								</li>
								<li className={`col px-2 py-1 text-center small user-select-none ${keepAnnualInterest ? 'bg-primaryColor text-gray-200' : 'border border-primaryColor text-primaryColor'} rounded-pill ptr clickDown`}
									onClick={() => { setKeepAnnualInterest(true); }}
								>
									Keep interest
								</li>
							</ul>
							<div className="alert bg-primaryColor text-light small rounded-4">
								{keepAnnualInterest ? (
									<>
										<p>
											<Info size={22} weight='fill' className='me-1 opacity-50' /> The interest earned by each member will be added to their total cotisation amount, along with the corresponding share count. Only the maximum share multiples (<CurrencyText amount={unitShareValue} /> per share) of the earned interest will be applied, while any remaining balance will be carried forward as the initial interest for the following year.
										</p>
									</>
								) : (
									<>
										<p>
											<Info size={22} weight='fill' className='me-1 opacity-50' /> The interest earned by each member will be calculated and withdrawn as requested. Only the maximum share multiples (<CurrencyText amount={unitShareValue} /> per share) of the earned interest are eligible for withdrawal, while any remaining balance will be carried forward as the initial interest for the following year.
										</p>
									</>
								)}

								<div className="modal-footer mt-3">
									<button
										type="button"
										className={`btn btn-sm me-3 text-gray-200 border-0 clickDown`}
										disabled={isWaitingFetchAction}
										onClick={() => setShowShareAnnualInterest(false)}
									>
										Cancel
									</button>
									<button
										type="submit"
										className={`btn bg-gray-200 text-primaryColor flex-align-center px-3 rounded-pill clickDown`}
										disabled={isWaitingFetchAction}
										onClick={() => distributeAnnualInterest()}
									>
										{!isWaitingFetchAction ? (
											<>
												{keepAnnualInterest ? 'Keep interest' : 'Withdraw interest'} <CaretRight />
											</>
										) : (
											<>
												Working <SmallLoader color='light' />
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					</>
				)}

				{/* Recent records */}
				{/* <ContentToggler
					state={showAnnualInterestRecords}
					setState={setShowAnnualInterestRecords}
					text="Interest Partition Records"
					className="ms-auto"
				/> */}

				{showAnnualInterestRecords && (
					<>
						<div className="d-flex flex-wrap justify-content-center gap-2 gap-lg-3 rounded">
							{allAnnualInterest
								.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
								.map((record, index) => (
									<div key={index} className='w-fit p-3 p-lg-4 border bg-primary-subtle ptr clickDown'
										onClick={() => { setSelectedAnnualInterestRecord(record); setShowSelectedAnnualInterestRecord(true) }}
									>
										{record.year}
									</div>
								))
							}
						</div>

						{showSelectedAnnualInterestRecord && (
							<>
								<Overlay
									titleText={
										<>
											{selectedAnnualInterestRecord?.year} interest partition
										</>
									}
									uppercaseTitleText
									titleIcon={
										<Coins weight='fill' className="me-1" />
									}
									onClose={() => setShowSelectedAnnualInterestRecord(false)}
									children={
										<>
											<div className='overflow-auto mb-5'>
												<table className="table table-hover h-100">
													<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
														<tr>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>N°</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Member</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Annual shares</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Interest received<sub className='fs-60'>/RWF</sub></th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Interest remains<sub className='fs-60'>/RWF</sub></th>
														</tr>
													</thead>
													<tbody>
														{allAnnualInterest
															.filter((record) => record.year === selectedAnnualInterestRecord.year)
															.map((record, index) => {
																const memberStatus = JSON.parse(record.memberStatus);
																return (
																	<Fragment key={index}>
																		<tr className="small cursor-default interest-row">
																			<td className="border-bottom-3 border-end bg-primaryColor text-light">
																				{selectedAnnualInterestRecord.year}
																			</td>
																			<td className='text-nowrap'>
																				Total shares : {record.totalShares}
																			</td>
																			<td>
																			</td>
																			<td></td>
																			<td></td>
																		</tr>

																		{memberStatus
																			.map((member, index) => {
																				const associatedMember = activeMembers.find(m => m.id === member.id);
																				const memberNames = `${associatedMember?.husbandFirstName} ${associatedMember?.husbandLastName}`;
																				return (
																					<tr key={index} className="small cursor-default interest-row">
																						<td className="border-bottom-3 border-end">
																							{index + 1}
																						</td>
																						<td className='text-nowrap'>
																							{memberNames}
																						</td>
																						<td>
																							{member.annualShares}
																						</td>
																						<td className="text-nowrap fw-bold text-success">
																							<CurrencyText amount={member.interestReceived} smallCurrency />
																						</td>
																						<td className="text-nowrap text-gray-700">
																							<CurrencyText amount={member.interestRemains} smallCurrency />
																						</td>
																					</tr>
																				)
																			})
																		}

																		<tr className="small cursor-default fs-5 table-success clickDown interest-row">
																			<td className="border-bottom-3 border-end" title='Total'>
																				T
																			</td>
																			<td className='text-nowrap'>
																				{totalMembers} <span className="fs-60">members</span>
																			</td>
																			<td className='text-nowrap'>
																				<div className="d-grid">
																					<CurrencyText amount={
																						JSON.parse(record.memberStatus).reduce((sum, item) => sum + item.annualShares, 0)
																					} smallCurrency />
																				</div>
																			</td>
																			<td className="text-nowrap">
																				<div className="d-grid">
																					<CurrencyText amount={
																						JSON.parse(record.memberStatus).reduce((sum, item) => sum + item.interestReceived, 0)
																					} smallCurrency />
																				</div>
																			</td>
																			<td className="text-nowrap fw-bold">
																				<CurrencyText amount={
																					JSON.parse(record.memberStatus).reduce((sum, item) => sum + item.interestRemains, 0)
																				} smallCurrency />
																			</td>
																		</tr>
																	</Fragment>
																)
															})
														}
													</tbody>
												</table>
											</div>
										</>
									}
								/>
							</>
						)}
					</>
				)}
			</div>
		)
	}

	// Credit
	const Credit = () => {
		const [activeLoanSection, setActiveLoanSection] = useState(
			allCredits.filter(cr => cr.status === 'pending').length
				? 'pending'
				: 'approved'
		);
		const [activeLoanSectionColor, setActiveLoanSectionColor] = useState('#a3d5bb75');

		// Filtering credits
		const [membersToShow, setMembersToShow] = useState(allMembers || []);
		const [memberSearchValue, setMemberSearchValue] = useState('');

		// Search members
		const memberSearcherRef = useRef();

		const filterMembersBySearch = useCallback(() => {
			const searchString = normalizedLowercaseString(memberSearchValue).trim();

			if (searchString) {
				const filteredMembers = activeAndInactiveMembers.filter((val) => {
					return (
						(val.husbandFirstName &&
							normalizedLowercaseString(val.husbandFirstName)
								.includes(searchString)) ||
						(val.husbandLastName &&
							normalizedLowercaseString(val.husbandLastName)
								.includes(searchString)) ||
						(val.wifeFirstName &&
							normalizedLowercaseString(val.wifeFirstName)
								.includes(searchString)) ||
						(val.wifeLastName &&
							normalizedLowercaseString(val.wifeLastName)
								.includes(searchString)) ||
						(val.husbandEmail &&
							val.husbandEmail.toLowerCase().includes(searchString)) ||
						(val.wifeEmail &&
							val.wifeEmail.toLowerCase().includes(searchString)) ||
						(val.husbandPhone &&
							val.husbandPhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString)) ||
						(val.wifePhone &&
							val.wifePhone.replace(/[ ()+]/g, '').toLowerCase().includes(searchString))
					);
				});

				setMembersToShow(filteredMembers);
			}
		}, [memberSearchValue]);

		const resetMembers = () => {
			setMembersToShow(activeAndInactiveMembers);
		}

		// Reset members
		useEffect(() => {
			if (memberSearchValue === '') {
				resetMembers();
			}
		}, [memberSearchValue]);

		// Show credits per member
		const [showSelectedMemberCredits, setShowSelectedMemberCredits] = useState(false);
		const [selectedMember, setSelectedMember] = useState(null);
		const [showSelectedMemberCreditRecords, setShowSelectedMemberCreditRecords] = useState(false);

		// Show credits per member
		const [showBackfillPlanCard, setShowBackfillPlanCard] = useState(false);
		const [selectedCredit, setSelectedCredit] = useState([]);
		const [associatedMember, setAssociatedMember] = useState([]);

		useEffect(() => {
			if (selectedCredit.length !== 0) {
				const id = selectedCredit.memberId;
				setAssociatedMember(allMembers.filter(m => m.id === id));
			}
		}, [selectedCredit,]);

		// handle approving a credit
		const approveCreditRequest = async (id) => {

			try {
				setIsWaitingFetchAction(true);
				const response = await fetch(`${BASE_URL}/credit/${id}/approve`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || errorData.error || 'Error approving credit request');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchCredits();
				fetchLoans();
				fetchFigures();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error approving credit:", error);
				warningToast({ message: error.message });
			} finally {
				setIsWaitingFetchAction(false);
				resetConfirmDialog();
			}
		};

		// handle rejecting a credit
		const rejectCreditRequest = async (id) => {
			try {
				setIsWaitingFetchAction(true);
				const response = await fetch(`${BASE_URL}/credit/${id}/reject`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: 'rejected', rejectionMessage: promptInputValue.current }),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error rejecting credit request');
				}
				// Successfull fetch
				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchCredits();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error fetching members:", error);
				warningToast({ message: error.message });
			} finally {
				setIsWaitingFetchAction(false);
				resetPrompt();
			}
		}

		// handle rejecting a credit
		const restoreCreditRequest = async (id) => {
			try {
				setIsWaitingFetchAction(true);
				const response = await fetch(`${BASE_URL}/credit/${id}/restore`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: 'pending' }),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error restoring credit request');
				}
				// Successfull fetch
				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchCredits();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error fetching members:", error);
				warningToast({ message: error.message });
			} finally {
				setIsWaitingFetchAction(false);
				resetConfirmDialog();
			}
		}

		/**
		 * Pay Loans
		 */

		const [showGlobalPaymentHistory, setShowGlobalPaymentHistory] = useState(false);

		const [payLoanAmount, setPayLoanAmount] = useState('');
		const [payInterestAmount, setPayInterestAmount] = useState(0);
		const [payTranchesAmount, setPayTranchesAmount] = useState(0);

		const resetPaymentinputs = () => {
			setPayLoanAmount('');
			setPayInterestAmount(0);
			setPayTranchesAmount(0);
		}

		const handeLoanPaymemnt = async (id) => {
			if (payLoanAmount <= 0) {
				return warningToast({ message: 'Enter payment amount to continue' })
			}

			try {
				setIsWaitingFetchAction(true);
				const response = await Axios.put(`/loan/${id}/pay`, {
					loanToPay: payLoanAmount,
					interestToPay: payInterestAmount,
					tranchesToPay: payTranchesAmount,
				});
				// Successfull fetch
				const data = response.data;
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchLoans();
				fetchCredits();
				fetchFigures();
				fetchRecords();
				resetPaymentinputs();
			} catch (error) {
				const errorMessage = error.response?.data?.error || error.response?.data?.message || "An unknown error occurred";
				setErrorWithFetchAction(errorMessage);
				cError("Error paying the loan:", error);
				warningToast({ message: errorMessage });
			} finally {
				setIsWaitingFetchAction(false);
			}
		}

		/**
		 * Apply loan penalties
		 */

		const [applyCreditPenalty, setApplyCreditPenalty] = useState(false);
		const [creditPenaltyAmount, setCreditPenaltyAmount] = useState('');
		const [penaltyComment, setPenaltyComment] = useState('');

		const handleApplyCreditPenalty = async (id) => {
			if (!creditPenaltyAmount || Number(creditPenaltyAmount) <= 0) {
				return warningToast({ message: 'Enter valid penalty amount to continue', type: 'gray-800' })
			}

			try {
				setIsWaitingFetchAction(true);

				const response = await Axios.post(`/user/${id}/credit-penalty`, {
					secondaryType: 'Credit penalty',
					penaltyAmount: creditPenaltyAmount,
					comment: penaltyComment
				});

				// Successful fetch
				const data = response.data;
				successToast({ message: data.message, selfClose: false });
				setApplyCreditPenalty(false);
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchRecords();
				fetchFigures();
			} catch (error) {
				const errorMessage = error.response?.data?.error || error.response?.data?.message || "An unknown error occurred";
				setErrorWithFetchAction(errorMessage);
				cError("Error applying penalties:", error);
				warningToast({ message: errorMessage, selfClose: false });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// Handle delete credit payment record
		const handleDeleteCreditPaymentRecord = async (values) => {
			if (!values || typeof values !== 'object') {
				return warningToast({ message: "Invalid record paramenters" });
			}

			if (!values.memberId || !values.recordId) {
				return warningToast({ message: "Missing require paramenters" });
			}

			try {
				setIsWaitingFetchAction(true);

				const payload = values;

				const response = await fetch(`${BASE_URL}/credit-payment/delete`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || errorData.error || 'Error deleting credit payment record');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchLoans();
				fetchFigures();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error.message || error.error);
				cError("Error deleting credit payment record:", error);
				warningToast({ message: error.message || error.error || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
				resetConfirmDialog();
			}
		};

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<h2 className='text-appColor'><Blueprint weight='fill' className="me-1 opacity-50" /> Credit panel</h2>
				{/* Search bar */}
				<SearchBar
					placeholder='🔍 Search members...'
					value={memberSearchValue}
					setValue={setMemberSearchValue}
					search={filterMembersBySearch}
					clearSearchValue={() => setMemberSearchValue('')}
					className="sticky-top col-lg-6 col-xxl-4 members-search-box"
					reference={memberSearcherRef}
				/>
				{/* Content */}
				{loadingMembers && (<LoadingIndicator icon={<Blueprint size={80} className="loading-skeleton" />} />)}
				{!loadingMembers && errorLoadingMembers && (
					<FetchError
						errorMessage={errorLoadingMembers}
						refreshFunction={() => fetchMembers()}
						className="mb-5 mt-4"
					/>
				)}
				{!loadingMembers && !errorLoadingMembers && !membersToShow.length && (
					<NotFound
						notFoundMessage="No member found"
						icon={<Users size={80} className="text-center w-100 mb-3 opacity-50" />}
						refreshFunction={resetMembers}
					/>
				)}
				{!loadingMembers && !errorLoadingMembers && membersToShow.length && (
					<>
						<div className="mb-3">
							<div className="d-flex justify-content-lg-between gap-2 mt-3 overflow-auto">
								{membersToShow
									.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
									.map((member, index) => (
										<Popover key={index} content={`${member?.husbandFirstName} ${member?.husbandLastName}`} trigger='hover' placement='bottom' className='d-none d-md-block py-1 px-2 smaller shadow-none border border-secondary border-opacity-25' arrowColor='var(--bs-gray-400)' height='1.9rem'>
											<div className='w-4rem ptr clickDown'
												onClick={() => { setSelectedMember(member); setShowSelectedMemberCredits(true) }}
											>
												<PersonAvatar type='man' data={member} size='4rem' bordered={false} className="w-100 p-1" />
												<div className="text-truncate fs-70 text-center mt-1">
													{`${member?.husbandFirstName} ${member?.husbandLastName}`}
												</div>
											</div>
										</Popover>
									))}
							</div>
							<div className="d-flex d-lg-none">
								<DotsThreeOutline size={30} weight='fill' className='ms-auto me-2 text-gray-500' />
							</div>
						</div>

						{/* Members Credits Stats */}

						<div className="mb-4 ms-auto d-flex gap-1">
							<ToogleButton icon={<ListChecks />} text='Credit payment history' func={() => setShowGlobalPaymentHistory(true)} />
						</div>

						{/* Member Credits Payment History */}
						{showGlobalPaymentHistory &&
							<>
								<Overlay
									titleText='Credit payment history'
									uppercaseTitleText
									titleIcon={
										<ListChecks
											className="flex-shrink-0 w-3rem h-3rem p-2 border border-3 border-secondary border-opacity-25 bg-light rounded-circle"
										/>
									}
									onClose={() => setShowGlobalPaymentHistory(false)}
									onCloseTitle='Close history'
									children={
										<>

											{allRecords
												.filter(cr => (cr.recordType === 'loan' && cr.recordSecondaryType === 'payment')).length > 0 ? (

												<div className='overflow-auto'>
													<table className="table table-striped table-hover h-100">
														<thead className='table-secondary position-sticky top-0 inx-1 1 text-uppercase small'>
															<tr>
																<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
																<th className='py-3 text-nowrap text-gray-700 fw-normal'>Member</th>
																<th className='py-3 text-nowrap text-gray-700 fw-normal'>Loan paid  <sub className='fs-60'>/RWF</sub></th>
																<th className='py-3 text-nowrap text-gray-700 fw-normal'>Interest Paid <sub className='fs-60'>/RWF</sub></th>
																<th className='py-3 text-nowrap text-gray-700 fw-normal'>Tranches Paid</th>
																<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date</th>
																<th className='py-3 text-nowrap text-gray-700 fw-normal'>Actions</th>
															</tr>
														</thead>
														<tbody>
															{allRecords
																.filter(cr => (cr.recordType === 'loan' && cr.recordSecondaryType === 'payment'))
																.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
																.map((record, index) => {

																	const associatedMember = allMembers?.find(m => m.id === record.memberId);
																	const memberNames = `${associatedMember?.husbandFirstName} ${associatedMember?.husbandLastName}`;
																	const transactionInfo = JSON.parse(record.comment);
																	const loanPaid = transactionInfo.loanPaid;
																	const interestPaid = transactionInfo.interestPaid;
																	const tranchesPaid = transactionInfo.tranchesPaid;

																	return (
																		<tr key={index} className="small cursor-default">
																			<td className="ps-sm-3 border-bottom-3 border-end">
																				{index + 1}
																			</td>
																			<td className="text-nowrap">
																				{memberNames}
																			</td>
																			<td>
																				<CurrencyText amount={Number(loanPaid)} />
																			</td>
																			<td>
																				<CurrencyText amount={Number(interestPaid)} />
																			</td>
																			<td>
																				{tranchesPaid}
																			</td>
																			<td className="text-nowrap" style={{ maxWidth: '13rem' }}>
																				<Popover content={<><Watch size={15} /> {getDateHoursMinutes(record.createdAt)}</>} trigger='hover' placement='top' className='flex-center py-1 px-2 bg-gray-400 text-dark border border-secondary border-opacity-25 text-tuncate smaller shadow-none' arrowColor='var(--bs-gray-400)' height='1.9rem' width='fit-content'>
																					<FormatedDate date={record.createdAt} />
																				</Popover>
																			</td>
																			<td className='text-center'>
																				<Menu menuButton={
																					<MenuButton className="border-0 p-0 bg-transparent">
																						<DotsThreeVertical size={20} weight='bold' />
																					</MenuButton>
																				} transition>
																					<MenuItem onClick={() => {
																						customConfirmDialog({
																							message: (
																								<>
																									<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><Trash size={25} weight='fill' className='opacity-50' /> Reverse credit payment record</h5>
																									<p>
																										This action will undo all credit payment transactions associated with this record and permanently remove it from the transaction history.<br /><br />
																										<span className='d-block alert alert-dark'>
																											<b>Member:</b> {memberNames}<br />
																											<b>Amount paid:</b> <CurrencyText amount={Number(JSON.parse(record.comment)?.loanPaid)} /><br />
																											<b>Interest paid:</b> <CurrencyText amount={Number(JSON.parse(record.comment)?.interestPaid)} /><br />
																											<b>Tranches paid:</b> {JSON.parse(record.comment)?.tranchesPaid}<br />
																											<b>Recorded on:</b> <FormatedDate date={record.createdAt} />.
																										</span>
																									</p>
																								</>
																							),
																							type: 'warning',
																							action: () => handleDeleteCreditPaymentRecord({
																								memberId: record.memberId,
																								recordId: record.id
																							}),
																							actionText: "Reverse record"
																						});
																					}}>
																						<ArrowsLeftRight weight='fill' className="me-2 opacity-50" /> Reverse record
																					</MenuItem>
																				</Menu>
																			</td>
																		</tr>
																	)
																})
															}
														</tbody>
													</table>
												</div>
											) : (
												<EmptyBox
													notFoundMessage={`No records available. Credit payment records/history will show up here as loans get paid.`}
												/>
											)}
										</>
									}
								/>
							</>
						}

						{/* Members Credits Stats */}
						<div className="mb-5" style={{ minHeight: creditsBarGraphMinHeight, }}>
							<BarGraph
								options={membersCreditsStatsOptions.current}
								data={membersCreditsStatsData}
								title='Members credits statistics'
							/>
						</div>

						{/* Member Credits History */}
						{showSelectedMemberCredits &&
							<>
								<Overlay
									titleIcon={
										<PersonAvatar type='man' data={selectedMember} className='flex-shrink-0' />
									}
									titleText={
										<>
											Credits of {`${selectedMember?.husbandFirstName} ${selectedMember?.husbandLastName}`}
										</>
									}
									onClose={() => { setShowSelectedMemberCredits(false); setShowSelectedMemberCreditRecords(false); }}
									onCloseTitle='Close history'
									children={
										<>
											{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0)).length ? (
												<>
													{allLoans.filter(loan => (loan.memberId === selectedMember?.id && loan.loanTaken > 0))
														.map((item, index) => {
															const selectedLoan = item;
															return (
																<Fragment key={index} >
																	<div className="d-xl-flex gap-3 pb-5">
																		{/* Loan status */}
																		<div className="col member-loan-status mb-4 mb-xl-0">
																			<div className="fs-6 fw-semibold text-primaryColor text-center text-uppercase">Loan status</div>
																			<hr />
																			<LoanStatusTable loanData={selectedLoan} />

																			{allCredits.filter(cr => cr.memberId === selectedMember?.id).length > 0 && (
																				<>
																					<div className="d-flex">
																						<div className='col p-2'>
																							<div className='flex-align-center text-muted border-bottom smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">First loan</span></div>
																							<div className='text-center bg-gray-300'>
																								<FormatedDate date={allCredits
																									.sort((a, b) => new Date(a.requestDate) - new Date(b.requestDate))
																									.filter(cr => cr.memberId === selectedMember?.id)[0].requestDate
																								} />
																							</div>
																						</div>
																						<div className='col p-2'>
																							<div className='flex-align-center text-muted border-bottom smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">Recent loan</span></div>
																							<div className='text-center bg-gray-300'>
																								<FormatedDate date={allCredits
																									.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
																									.filter(cr => cr.memberId === selectedMember?.id)[0].requestDate
																								} />
																							</div>
																						</div>
																					</div>
																				</>
																			)}
																		</div>

																		{/* Loan payment form */}
																		<div className='col col-xl-5 member-loan-payment'>
																			{selectedLoan?.loanPending > 0 ? (
																				<>
																					<div className="fs-6 fw-semibold text-primaryColor text-center text-uppercase">Payment</div>
																					<hr />
																					<div>
																						<div className='mb-3'>
																							<div className="d-sm-flex px-1">
																								<div className="col mb-2 ps-2 mb-sm-0 border-start border-secondary border-opacity-50">
																									<div className='small mb-sm-3'>Remaining Loan</div>
																									<div className="px-2 text-danger-emphasis">
																										<CurrencyText amount={selectedLoan?.loanPending} />
																									</div>
																								</div>
																								<div className='col'>
																									<label htmlFor="payLoanAmount" className="form-label" required>Pay loan ({payLoanAmount !== '' ? Number(payLoanAmount).toLocaleString() : ''} RWF )</label>
																									<input type="number" id="payLoanAmount" name="payLoanAmount" className="form-control rounded-0 border-secondary border-opacity-50 shadow-none" min="1" required placeholder="Enter amount"
																										value={payLoanAmount}
																										onChange={e => setPayLoanAmount(e.target.value)}
																									/>
																								</div>
																							</div>
																							{payLoanAmount > Number(selectedLoan?.loanPending) && (
																								<div className='form-text d-flex gap-2 bg-danger-subtle mt-2 p-2 rounded-bottom-4'>
																									<Warning />
																									<span className='fs-75'>Amount to pay cannot be grater than the remaining amount</span>
																								</div>
																							)}
																						</div>

																						{selectedLoan?.interestPending > 0 && (
																							<div className='mb-3'>
																								<div className="d-sm-flex px-1">
																									<div className="col mb-2 ps-2 mb-sm-0 border-start border-secondary border-opacity-50">
																										<div className='small mb-sm-3'>Remaining Interest</div>
																										<div className="px-2 text-danger-emphasis">
																											<CurrencyText amount={selectedLoan?.interestPending} />
																										</div>
																									</div>
																									<div className='col'>
																										<label htmlFor="payInterestAmount" className="form-label" required>Pay interest ({payInterestAmount !== '' ? Number(payInterestAmount).toLocaleString() : ''} RWF )</label>
																										<input type="number" id="payInterestAmount" name="payInterestAmount" className="form-control rounded-0 border-secondary border-opacity-50 shadow-none" min="1" required placeholder="Enter amount"
																											value={payInterestAmount}
																											onChange={e => setPayInterestAmount(e.target.value)}
																										/>
																									</div>
																								</div>
																								{payInterestAmount > Number(selectedLoan?.interestPending) && (
																									<div className='form-text d-flex gap-2 bg-danger-subtle mt-2 p-2 rounded-bottom-4'>
																										<Warning />
																										<span className='fs-75'>Amount to pay cannot be grater than the remaining amount</span>
																									</div>
																								)}
																							</div>
																						)}

																						<div className='mb-3'>
																							<div className="d-sm-flex px-1">
																								<div className="col mb-2 ps-2 mb-sm-0 border-start border-secondary border-opacity-50">
																									<div className='small mb-sm-3'>Remaining Traches</div>
																									<div className="px-2 text-danger-emphasis">
																										{selectedLoan?.tranchesPending}
																									</div>
																								</div>
																								<div className='col'>
																									<label htmlFor="payTranchesAmount" className="form-label" required>Pay tranches ( {payTranchesAmount} )</label>
																									<input type="number" id="payTranchesAmount" name="payTranchesAmount" className="form-control rounded-0 border-secondary border-opacity-50 shadow-none" min="1" required placeholder="Enter amount"
																										value={payTranchesAmount}
																										onChange={e => setPayTranchesAmount(e.target.value)}
																									/>
																								</div>
																							</div>
																							{payTranchesAmount > Number(selectedLoan?.tranchesPending) && (
																								<div className='form-text d-flex gap-2 bg-danger-subtle mt-2 p-2 rounded-bottom-4'>
																									<Warning />
																									<span className='fs-75'>Amount to pay cannot be grater than the remaining amount</span>
																								</div>
																							)}
																						</div>
																					</div>

																					<div className="d-flex">
																						<button className="col btn btn-sm text-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																							onClick={() => resetPaymentinputs()}
																						>
																							Clear
																						</button>
																						<button className="col btn btn-sm btn-dark w-100 flex-center py-2 border-dark rounded-0 clickDown"
																							disabled={(
																								payLoanAmount > Number(selectedLoan?.loanPending)
																								|| payInterestAmount > Number(selectedLoan?.interestPending)
																								|| payTranchesAmount > Number(selectedLoan?.tranchesPending)
																								|| isWaitingFetchAction
																							)}
																							onClick={() => { handeLoanPaymemnt(selectedLoan?.id); }}
																						>
																							{!isWaitingFetchAction ?
																								<>Save payment <FloppyDisk size={18} className='ms-2' /></>
																								: <>Working <SmallLoader color='light' /></>
																							}
																						</button>
																					</div>
																				</>
																			) : (
																				<div className="grid-center fs-5 py-5">
																					<CheckCircle size={40} weight='fill' className="w-4rem h-4rem d-block mx-auto mb-2 text-success" />
																					<p className="text-center text-gray-700 fw-light small">Requested loan is fully paid.</p>
																				</div>
																			)}
																		</div>
																	</div>

																	<hr className='mt-0 mb-4' />

																	{/* Toggle Credit Records */}
																	<ContentToggler
																		state={showSelectedMemberCreditRecords}
																		setState={setShowSelectedMemberCreditRecords}
																		text={<>Credit records for {selectedMember?.husbandFirstName}</>}
																		className="ms-auto"
																	/>

																	{showSelectedMemberCreditRecords && (
																		<>
																			<div className='overflow-auto'>
																				<table className="table table-hover h-100">
																					<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
																						<tr>
																							<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date & Interval</th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
																							<th className='py-3 text-nowrap text-gray-700 fw-normal'>Credit Status</th>
																						</tr>
																					</thead>
																					<tbody>

																						{allCredits.filter(cr => (cr.memberId === selectedMember?.id && cr.status === 'approved'))
																							.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
																							.map((credit, index) => {
																								const associatedMember = allMembers?.find(m => m.id === credit.memberId);
																								const memberNames = `${associatedMember?.husbandFirstName} ${associatedMember?.husbandLastName}`;
																								const creditInterest = Number(credit.creditAmount) * (5 / 100);

																								return (
																									<tr key={index} className={`small loan-row`}>
																										<td className={`ps-sm-3 border-bottom-3 border-end`}>
																											{index + 1}
																										</td>
																										<td >
																											{memberNames}
																										</td>
																										<td className="d-flex flex-column gap-2 text-muted" >
																											<div>
																												<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
																												<span>{Number(credit.creditAmount).toLocaleString()}</span>
																											</div>
																											<div>
																												<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
																												<span>{creditInterest.toLocaleString()}</span>
																											</div>
																											<div className='text-primaryColor'>{credit.tranches} tranche{credit.tranches > 1 ? 's' : ''}</div>
																										</td>
																										<td className='text-nowrap'>
																											<div className='d-flex flex-column gap-1 smaller'>
																												<span>
																													<FormatedDate date={credit.requestDate} monthFormat='numeric' /> <CaretRight /> <FormatedDate date={credit.dueDate} monthFormat='numeric' />
																												</span>
																												<span>{printDatesInterval(credit.requestDate, credit.dueDate)}</span>
																												<span className="flex-align-center text-primaryColor ptr clickDown"
																													onClick={() => { setSelectedCredit(credit); setShowBackfillPlanCard(true); }}
																												><Receipt weight='fill' size={18} className='me-1' /> Tableau d'amortissement</span>
																											</div>
																										</td>
																										<td style={{ maxWidth: '13rem' }}>
																											{credit.comment}
																										</td>
																										<td className='text-nowrap'>
																											Transfered
																										</td>
																									</tr>
																								)
																							})
																						}
																					</tbody>
																				</table>
																			</div>
																		</>
																	)}

																</Fragment>
															)
														})
													}
												</>
											) : (
												<>
													<EmptyBox
														notFoundMessage={`No credit records found for this member. It appears they have not received a loan yet.`}
														refreshKeyword="Got it"

														refreshFunction={() => setShowSelectedMemberCredits(false)}
													/>
												</>
											)}

											{/* Credit penalties */}
											<div className="mb-3">
												<ContentToggler
													state={applyCreditPenalty}
													setState={setApplyCreditPenalty}
													text="Apply penalties"
													className="ms-auto"
												/>

												{applyCreditPenalty && (
													<>
														<form onSubmit={e => e.preventDefault()} className="px-sm-2 pb-5">
															<div className="mb-3">
																<label htmlFor="penaltyAmount" className="form-label fw-bold" required>Penalty amount ({creditPenaltyAmount !== '' ? Number(creditPenaltyAmount).toLocaleString() : ''} RWF )</label>
																<input type="number" id="penaltyAmount" name="penaltyAmount" className="form-control" min="1" required placeholder="Enter amount"
																	value={creditPenaltyAmount}
																	onChange={e => setCreditPenaltyAmount(e.target.value)}
																/>
															</div>
															<div className="mb-3">
																<label htmlFor="penaltyComment" className="form-label fw-bold" required>Penalty comment</label>
																<textarea rows={3} id="penaltyComment" name="penaltyComment" className="form-control" placeholder="Enter comment"
																	value={penaltyComment}
																	onChange={e => setPenaltyComment(e.target.value)}
																></textarea>
															</div>

															<button type="submit" className="btn btn-sm btn-outline-dark flex-center w-100 py-2 px-4 rounded-pill clickDown" id="applyPenaltyBtn"
																onClick={() => handleApplyCreditPenalty(selectedMember?.id)}
															>
																{!isWaitingFetchAction ?
																	<>Apply penalty <Gavel size={18} className='ms-2' /></>
																	: <>Working <SmallLoader color='gray-500' /></>
																}
															</button>
														</form>
													</>
												)}
											</div>
										</>
									}
								/>
							</>
						}
					</>
				)}

				<div className='text-gray-700 selective-options' style={{ backgroundColor: activeLoanSectionColor }}>
					{/* <h4 className='h6 mb-2 text-center fw-bold text-decoration-underline' style={{ textUnderlineOffset: '3px' }}>Loan requests</h4> */}
					{loadingCredits && (<LoadingIndicator text="Loading credits..." />)}
					{!loadingCredits && errorLoadingCredits && (
						<FetchError
							errorMessage={errorLoadingCredits}
							refreshFunction={() => fetchCredits()}
							className="mb-5 mt-4"
						/>
					)}
					{!loadingCredits && !errorLoadingCredits && !creditsToShow.length && (
						<div className="col-sm-8 col-md-6 col-lg-5 col-xl-4 mx-auto my-5 p-3 rounded error-message">
							<img src="/images/fetch_error_image.jpg" alt="Error" className="w-4rem h-4rem mx-auto mb-2 opacity-50" />
							<p className="text-center text-muted small">
								No credits found.
							</p>
							<button className="btn btn-sm btn-outline-secondary d-block border-0 rounded-pill mx-auto px-4" onClick={fetchCredits}>
								<ArrowClockwise weight="bold" size={18} className="me-1" /> Refresh
							</button>
						</div>
					)}
					{!loadingCredits && !errorLoadingCredits && !loadingMembers && !errorLoadingMembers && creditsToShow.length && (
						<>
							{/* Selectors */}
							<div className="d-flex flex-wrap justify-content-center">
								<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-warning border-opacity-25 tab-selector ${activeLoanSection === 'pending' ? 'active' : ''} user-select-none ptr clickDown`}
									style={{ '--_activeColor': '#f4e4b6' }}
									onClick={() => { setActiveLoanSection('pending'); setActiveLoanSectionColor('#f4e4b675') }}
								>
									<h5 className='mb-0 small'>Pending</h5>
									<p className='mb-0 fs-75'>( {creditsToShow.filter(cr => cr.status === 'pending').length} )</p>
								</div>
								<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-success border-opacity-25 tab-selector ${activeLoanSection === 'approved' ? 'active' : ''} user-select-none ptr clickDown`}
									style={{ '--_activeColor': '#a3d5bb' }}
									onClick={() => { setActiveLoanSection('approved'); setActiveLoanSectionColor('#a3d5bb75') }}
								>
									<h5 className='mb-0 small'>Approved</h5>
									<p className='mb-0 fs-75'>( {creditsToShow.filter(cr => cr.status === 'approved').length} )</p>
								</div>
								<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-danger border-opacity-25 tab-selector ${activeLoanSection === 'rejected' ? 'active' : ''} user-select-none ptr clickDown`}
									style={{ '--_activeColor': '#ebc1c5' }}
									onClick={() => { setActiveLoanSection('rejected'); setActiveLoanSectionColor('#ebc1c575') }}
								>
									<h5 className='mb-0 small'>Rejected</h5>
									<p className='mb-0 fs-75'>( {creditsToShow.filter(cr => cr.status === 'rejected').length} )</p>
								</div>
							</div>

							{/* Selected content */}
							<div style={{ minHeight: '60vh' }}>
								{activeLoanSection === 'pending' && (
									<>
										{creditsToShow.filter(cr => cr.status === 'pending').length > 0 && (
											<div className='overflow-auto'>
												<table className="table table-hover h-100">
													<thead className='table-warning position-sticky top-0 inx-1 1 text-uppercase small'>
														<tr>
															<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date & Interval</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Actions</th>
														</tr>
													</thead>
													<tbody>
														{creditsToShow
															.filter(cr => cr.status === 'pending')
															.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
															.map((credit, index) => {
																const associatedMember = allMembers?.find(m => m.id === credit.memberId);
																const memberNames = `${associatedMember?.husbandFirstName} ${associatedMember?.husbandLastName}`;
																const creditInterest = Number(credit.creditAmount) * (5 / 100);

																return (
																	<tr key={index} className={`small loan-row`}>
																		<td className={`ps-sm-3 border-bottom-3 border-end`}>
																			{index + 1}
																		</td>
																		<td >
																			{memberNames}
																		</td>
																		<td className="d-flex flex-column gap-2 text-muted" >
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
																				<span>{Number(credit.creditAmount).toLocaleString()}</span>
																			</div>
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
																				<span>{creditInterest.toLocaleString()}</span>
																			</div>
																			<div className='text-primaryColor'>{credit.tranches} tranche{credit.tranches > 1 ? 's' : ''}</div>
																		</td>
																		<td className='text-nowrap'>
																			<div className='d-flex flex-column gap-1 smaller'>
																				<span>
																					<FormatedDate date={credit.requestDate} monthFormat='numeric' /> <CaretRight /> <FormatedDate date={credit.dueDate} monthFormat='numeric' />
																				</span>
																				<span>{printDatesInterval(credit.requestDate, credit.dueDate)}</span>
																				<span className="flex-align-center text-primaryColor ptr clickDown"
																					onClick={() => { setSelectedCredit(credit); setShowBackfillPlanCard(true); }}
																				><Receipt weight='fill' size={18} className='me-1' /> Tableau d'amortissement</span>
																			</div>
																		</td>
																		<td style={{ maxWidth: '13rem' }}>
																			{credit.comment}
																		</td>
																		<td className='text-nowrap'>
																			<div className="dim-100 d-flex">
																				<button className='btn btn-sm text-primary-emphasis border-primary border-opacity-25 mb-auto rounded-0'
																					onClick={
																						() => {
																							if (Number(allFigures?.balance) < Number(credit.creditAmount)) {
																								warningToast({
																									message:
																										<>
																											<WarningCircle size={22} weight='fill' className='me-1 opacity-50' />
																											<span className="ms-1">Insufficient balance. <CurrencyText amount={Number(allFigures?.balance)} smallCurrency className="fw-semibold ms-1" />. Credit can not be approved.</span>
																										</>,
																									selfClose: false,
																								});
																							} else {
																								customConfirmDialog({
																									message: (
																										<>
																											<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><HandCoins size={25} weight='fill' className='opacity-50' /> Approve credit request</h5>
																											<p className='bg-dark text-gray-300 p-2 rounded'>
																												This will approve a credit of <CurrencyText amount={Number(credit.creditAmount)} /> requested by {memberNames}.<br /><br />Are you sure to continue?
																											</p>
																										</>
																									),
																									action: () => approveCreditRequest(credit.id),
																								});
																							}
																						}
																					}
																				>
																					<Check /> Approve
																				</button>
																				<button className='btn btn-sm text-danger-emphasis border-danger border-opacity-25 mt-auto rounded-0'
																					onClick={
																						() => {
																							customPrompt({
																								message: (
																									<>
																										<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><ReceiptX size={25} weight='fill' className='opacity-50' /> Reject credit request</h5>
																										<p>
																											Provide a reason for rejecting this request and any helpful feedback.
																										</p>
																									</>
																								),
																								inputType: 'textarea',
																								action: () => rejectCreditRequest(credit.id),
																								placeholder: 'Rejection message',
																							})
																						}
																					}
																				>
																					<X /> Reject
																				</button>
																			</div>
																		</td>
																	</tr>
																)
															})
														}
													</tbody>
												</table>
											</div>
										)}
										{/* Zero content - no credits */}
										{!creditsToShow.filter(cr => cr.status === 'pending').length > 0 && (
											<NotFound
												notFoundMessage="No pending credits found"
												icon={<Receipt size={80} className="text-center w-100 mb-3 opacity-50" />}
												refreshFunction={fetchCredits}
											/>
										)}
									</>
								)}

								{activeLoanSection === 'approved' && (
									<>
										{creditsToShow.filter(cr => cr.status === 'approved').length > 0 && (
											<div className='overflow-auto'>
												<table className="table table-hover h-100">
													<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
														<tr>
															<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date & Interval</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Credit Status</th>
														</tr>
													</thead>
													<tbody>
														{creditsToShow
															.filter(cr => cr.status === 'approved')
															.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
															.map((credit, index) => {
																const associatedMember = allMembers?.find(m => m.id === credit.memberId);
																const memberNames = `${associatedMember?.husbandFirstName} ${associatedMember?.husbandLastName}`;
																const creditInterest = Number(credit.creditAmount) * (5 / 100);

																return (
																	<tr key={index} className={`small loan-row`}>
																		<td className={`ps-sm-3 border-bottom-3 border-end`}>
																			{index + 1}
																		</td>
																		<td >
																			{memberNames}
																		</td>
																		<td className="d-flex flex-column gap-2 text-muted" >
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
																				<span>{Number(credit.creditAmount).toLocaleString()}</span>
																			</div>
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
																				<span>{creditInterest.toLocaleString()}</span>
																			</div>
																			<div className='text-primaryColor'>{credit.tranches} tranche{credit.tranches > 1 ? 's' : ''}</div>
																		</td>
																		<td className='text-nowrap'>
																			<div className='d-flex flex-column gap-1 smaller'>
																				<span>
																					<FormatedDate date={credit.requestDate} monthFormat='numeric' /> <CaretRight /> <FormatedDate date={credit.dueDate} monthFormat='numeric' />
																				</span>
																				<span>{printDatesInterval(credit.requestDate, credit.dueDate)}</span>
																				<span className="flex-align-center text-primaryColor ptr clickDown"
																					onClick={() => { setSelectedCredit(credit); setShowBackfillPlanCard(true); }}
																				><Receipt weight='fill' size={18} className='me-1' /> Tableau d'amortissement</span>
																			</div>
																		</td>
																		<td style={{ maxWidth: '13rem' }}>
																			{credit.comment}
																		</td>
																		<td className='text-nowrap'>
																			Transfered
																		</td>
																	</tr>
																)
															})
														}
													</tbody>
												</table>
											</div>
										)}
										{/* Zero content - no credits */}
										{!creditsToShow.filter(cr => cr.status === 'approved').length > 0 && (
											<NotFound
												notFoundMessage="No approved credits found"
												icon={<Receipt size={80} className="text-center w-100 mb-3 opacity-50" />}
												refreshFunction={fetchCredits}
											/>
										)}
									</>

								)}

								{activeLoanSection === 'rejected' && (
									<>
										{creditsToShow.filter(cr => cr.status === 'rejected').length > 0 && (
											<div className='overflow-auto'>
												<table className="table table-hover h-100">
													<thead className='table-danger position-sticky top-0 inx-1 1 text-uppercase small'>
														<tr>
															<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date & Interval</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Rejection</th>
															<th className='py-3 text-nowrap text-gray-700 fw-normal'>Actions</th>
														</tr>
													</thead>
													<tbody>
														{creditsToShow
															.filter(cr => cr.status === 'rejected')
															.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
															.map((credit, index) => {
																const associatedMember = allMembers?.find(m => m.id === credit.memberId);
																const memberNames = `${associatedMember?.husbandFirstName} ${associatedMember?.husbandLastName}`;
																const creditInterest = Number(credit.creditAmount) * (5 / 100);

																return (
																	<tr key={index} className={`small cursor-default loan-row`}>
																		<td className={`ps-sm-3 border-bottom-3 border-end`}>
																			{index + 1}
																		</td>
																		<td >
																			{memberNames}
																		</td>
																		<td className="d-flex flex-column gap-2 text-muted" >
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Loan</h6>
																				<span>{Number(credit.creditAmount).toLocaleString()}</span>
																			</div>
																			<div>
																				<h6 className='m-0 border-bottom border-2 fs-95 fw-bold'>Interest</h6>
																				<span>{creditInterest.toLocaleString()}</span>
																			</div>
																			<div className='text-primaryColor'>{credit.tranches} tranche{credit.tranches > 1 ? 's' : ''}</div>
																		</td>
																		<td className='text-nowrap'>
																			<div className='d-flex flex-column gap-1 smaller'>
																				<span>
																					<FormatedDate date={credit.requestDate} monthFormat='numeric' /> <CaretRight /> <FormatedDate date={credit.dueDate} monthFormat='numeric' />
																				</span>
																				<span>{printDatesInterval(credit.requestDate, credit.dueDate)}</span>
																				<span className="flex-align-center text-primaryColor ptr clickDown"
																					onClick={() => { setSelectedCredit(credit); setShowBackfillPlanCard(true); }}
																				><Receipt weight='fill' size={18} className='me-1' /> Tableau d'amortissement</span>
																			</div>
																		</td>
																		<td style={{ maxWidth: '13rem' }}>
																			{credit.comment}
																		</td>
																		<td style={{ maxWidth: '13rem' }}>
																			{credit.rejectionMessage}
																		</td>
																		<td className='text-nowrap'>
																			<div className="dim-100 d-flex">
																				<button className='btn btn-sm text-primary-emphasis border-primary border-opacity-25 mb-auto rounded-0'
																					onClick={
																						() => {
																							customConfirmDialog({
																								message: (
																									<>
																										<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><Receipt size={25} weight='fill' className='opacity-50' /> Restore Credit Request</h5>
																										<p>
																											A credit request of <CurrencyText amount={Number(credit.creditAmount)} /> submitted by {memberNames} will be restored and marked as pending for further actions.
																										</p>
																									</>
																								),
																								action: () => restoreCreditRequest(credit.id),
																								actionText: 'Restore',
																							});
																						}
																					}
																				>
																					<ArrowArcLeft /> Restore
																				</button>
																				<button className='btn btn-sm flex-align-center text-danger-emphasis border-danger border-opacity-25 mt-auto rounded-0'
																					onClick={
																						() => fncPlaceholder()
																					}
																				>
																					<TextStrikethrough /> Invalidate
																				</button>
																			</div>
																		</td>
																	</tr>
																)
															})
														}
													</tbody>
												</table>
											</div>
										)}
										{/* Zero content - no credits */}
										{!creditsToShow.filter(cr => cr.status === 'rejected').length > 0 && (
											<NotFound
												notFoundMessage="No rejected credits found"
												icon={<Receipt size={80} className="text-center w-100 mb-3 opacity-50" />}
												refreshFunction={fetchCredits}
											/>
										)}
									</>
								)}

								{showBackfillPlanCard && (
									<>
										<Overlay
											titleIcon={
												<Receipt weight='fill' className="me-1 flex-shrink-0" />
											}
											titleText="Tableau d'amortissement"
											uppercaseTitleText
											onClose={() => { setShowBackfillPlanCard(false); }}
											children={
												<>
													<div className="pb-5">
														<div className='alert d-lg-flex align-items-end gap-3 border-0 rounded-0 shadow-sm'>
															<div className='fw-light'>
																{associatedMember[0] && (
																	<>
																		<div className='d-flex gap-2 mb-2'>
																			<PersonAvatar type='man' data={associatedMember[0]} size='3rem' className='flex-shrink-0' />
																			<div className='mt-1 fs-4 text-dark' style={{ lineHeight: 1 }}>
																				Backfill Plan of {
																					`${associatedMember[0].husbandFirstName} ${associatedMember[0].husbandLastName}`
																				}
																			</div>
																		</div>
																		<ul className='list-unstyled smaller'>
																			<li>
																				{/* Sort by most recent, filter with corresponding member's id and find index
																				 of the credit + 1 in the array which will be the nth credit requested*/}
																				<b className='fw-semibold me-1'>Credit N°:</b> {
																					creditsToShow
																						.sort((a, b) => new Date(a.requestDate) - new Date(b.requestDate))
																						.filter(cr => cr.memberId === associatedMember[0].id)
																						.findIndex(cr => cr.id === selectedCredit.id) + 1
																				}
																			</li>
																			<li>
																				<b className='fw-semibold me-1'>Comment:</b> {selectedCredit.comment}
																			</li>
																		</ul>
																	</>
																)}
															</div>
															<div className="d-flex flex-wrap ms-lg-auto">
																<div className='col px-2'>
																	<div className='flex-align-center smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">Payment start date</span></div>
																	<div className='text-center bg-gray-300'><FormatedDate date={selectedCredit.requestDate} /></div>
																</div>
																<div className='col px-2'>
																	<div className='flex-align-center smaller'><Calendar className='me-1 opacity-50' /> <span className="text-nowrap">Payment due date</span></div>
																	<div className='text-center bg-gray-300'><FormatedDate date={selectedCredit.dueDate} /></div>
																</div>
															</div>
														</div>
														<ul className="list-unstyled d-flex flex-wrap gap-3 px-1 px-sm-2 px-lg-3 small">
															<li className='border-start border-dark border-opacity-50 ps-2'>
																<b>Amount requested</b>: <CurrencyText amount={Number(selectedCredit.creditAmount)} />
															</li>
															<li className='border-start border-dark border-opacity-50 ps-2'>
																<b>Interest</b>: <CurrencyText amount={
																	JSON.parse(selectedCredit.creditPayment).reduce((sum, tr) => sum + Number(tr.tranchAmount), 0) -
																	Number(selectedCredit.creditAmount)
																} />
															</li>
															<li className='border-start border-dark border-opacity-50 ps-2'>
																<b>Amount to pay</b>: <CurrencyText amount={
																	JSON.parse(selectedCredit.creditPayment).reduce((sum, tr) => sum + Number(tr.tranchAmount), 0)
																} />
															</li>
														</ul>

														{/* The plan */}
														<div className='overflow-auto'>
															<table className="table table-hover h-100">
																<thead className='table-secondary position-sticky top-0 inx-1 text-uppercase small'>
																	<tr>
																		<th className='ps-sm-3 py-3 text-nowrap text-gray-700 fw-normal'>Tranche</th>
																		<th className='py-3 text-nowrap text-gray-700 fw-normal fw-normal'>Backfill amount</th>
																		<th className='py-3 text-nowrap text-gray-700 fw-normal fw-normal'>Backfill date</th>
																	</tr>
																</thead>
																<tbody>
																	{JSON.parse(selectedCredit.creditPayment)
																		.sort((a, b) => a.tranchNumber - b.tranchNumber) // Sort tranches
																		.map((item, index) => (
																			<tr key={index} className="small">
																				<td className="ps-sm-3 border-bottom-3 border-end">
																					{item.tranchNumber}
																				</td>
																				<td>
																					<CurrencyText amount={Number(item.tranchAmount)} />
																				</td>
																				<td>
																					<FormatedDate date={item.tranchDueDate} />
																				</td>
																			</tr>
																		))
																	}
																</tbody>
															</table>
														</div>

														{activeLoanSection === 'pending' && selectedCredit.status === 'pending' && (
															<div className='d-flex flex-wrap align-items-center justify-content-end gap-3 mb-4 py-4'>
																<button className='btn btn-sm flex-align-center text-danger-emphasis border-danger border-opacity-25 mt-auto rounded-0'
																	onClick={
																		() => {
																			customPrompt({
																				message: (
																					<>
																						<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><ReceiptX size={25} weight='fill' className='opacity-50' /> Reject Credit Request</h5>
																						<p>
																							Provide a reason for rejecting this request and any helpful feedback.
																						</p>
																					</>
																				),
																				inputType: 'textarea',
																				action: () => rejectCreditRequest(selectedCredit.id),
																				placeholder: 'Rejection message',
																			})
																		}
																	}
																>
																	<X /> Reject credit</button>
																<button className='btn btn-sm flex-align-center text-primary-emphasis border-primary border-opacity-25 mb-auto rounded-0'
																	onClick={
																		() => {
																			if (Number(allFigures?.balance) < Number(selectedCredit.creditAmount)) {
																				warningToast({
																					message:
																						<>
																							<WarningCircle size={22} weight='fill' className='me-1 opacity-50' />
																							<span className="ms-1">Insufficient balance. <CurrencyText amount={Number(allFigures?.balance)} smallCurrency className="fw-semibold ms-1" />. Credit can not be approved.</span>
																						</>,
																					selfClose: false,
																				});
																			} else {
																				customConfirmDialog({
																					message: (
																						<>
																							<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><HandCoins size={25} weight='fill' className='opacity-50' /> Approve credit request</h5>
																							<p className='bg-dark text-gray-300 p-2 rounded'>
																								This will approve a credit of <CurrencyText amount={Number(selectedCredit.creditAmount)} /> requested by {`${associatedMember[0].husbandFirstName} ${associatedMember[0].husbandLastName}`}.<br /><br />Are you sure to continue?
																							</p>
																						</>
																					),
																					action: () => approveCreditRequest(selectedCredit.id),
																				});
																			}
																		}
																	}
																>
																	<Check /> Approve credit
																</button>
															</div>
														)}
													</div>
												</>
											}
										/>
									</>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		);
	}

	// Transactions
	const Transactions = () => {
		const [activeTransactionSection, setActiveTransactionSection] = useState('withdrawals');
		const [activeTransactionSectionColor, setActiveTransactionSectionColor] = useState('#f4e4b675');

		// Adding expense records
		const [showAddExpenseRecord, setShowAddExpenseRecord] = useState(false);
		const [expenseRecordType, setExpenseRecordType] = useState('');
		const [expenseRecordAmount, setExpenseRecordAmount] = useState('');
		const [expenseComment, setExpenseComment] = useState('');

		const [transactions, setTransactions] = useState(
			recordsToShow
				.filter(cr => cr.recordType === 'expense')
				.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		);

		// Handle add expense
		const handleAddExpense = async (e) => {
			e.preventDefault();
			if (!expenseRecordAmount || Number(expenseRecordAmount) <= 0) {
				return warningToast({ message: 'Enter valid expense amount to continue', type: 'gray-800' })
			}

			try {
				setIsWaitingFetchAction(true);

				const response = await fetch(`${BASE_URL}/records/recordExpense`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						secondaryType: expenseRecordType,
						expenseAmount: expenseRecordAmount,
						comment: expenseComment[0].toUpperCase() + expenseComment.slice(1)
					}),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || errorData.error || 'Error recording the expense');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setShowAddExpenseRecord(false);
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchRecords();
				fetchFigures();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error adding savings:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
			}
		};

		// Handle edit expense
		const handleEditExpense = async (values) => {
			if (!values || typeof values !== 'object') {
				return warningToast({ message: "Invalid record values" });
			}

			const { id, newExpenseAmount } = values;

			if (!id || !newExpenseAmount) {
				return warningToast({ message: "Missing required edit parameter" });
			}

			try {
				setIsWaitingFetchAction(true);

				const payload = values;

				const response = await fetch(`${BASE_URL}/expense-record/edit`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || errorData.error || 'Error updating expense record');
				}

				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchFigures();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error updating expense record:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
				resetPrompt();
			}
		};

		// Handle delete expense
		const handleDeleteExpense = async (recordId) => {
			if (!recordId || (recordId && typeof recordId !== 'number')) {
				return warningToast({ message: "Invalid record ID" });
			}

			try {
				setIsWaitingFetchAction(true);

				// return console.log(recordId);

				const response = await fetch(`${BASE_URL}/expense-record/delete`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: recordId }),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || errorData.error || 'Error deleting expense record');
				}

				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchFigures();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error deleting expense record:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
				resetConfirmDialog();
			}
		};

		// Handle edit penalty
		const handleEditPenalty = async (values) => {
			if (!values || typeof values !== 'object') {
				return warningToast({ message: "Invalid record values" });
			}

			const { id, newPenaltyAmount } = values;

			if (!id || !newPenaltyAmount) {
				return warningToast({ message: "Missing required edit parameter" });
			}

			try {
				setIsWaitingFetchAction(true);

				const payload = values;

				const response = await fetch(`${BASE_URL}/penalty-record/edit`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || errorData.error || 'Error updating penalty record');
				}

				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchFigures();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error updating penalty record:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
				resetPrompt();
			}
		};

		// Handle delete penalty
		const handleDeletePenalty = async (recordId) => {
			if (!recordId || (recordId && typeof recordId !== 'number')) {
				return warningToast({ message: "Invalid record ID" });
			}

			try {
				setIsWaitingFetchAction(true);

				// return console.log(recordId);

				const response = await fetch(`${BASE_URL}/penalty-record/delete`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: recordId }),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || errorData.error || 'Error deleting penalty record');
				}

				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchFigures();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error deleting penalty record:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
				resetConfirmDialog();
			}
		};

		useEffect(() => {
			if (activeTransactionSection === 'withdrawals') {
				setActiveTransactionSectionColor('#f4e4b675');
			} else if (activeTransactionSection === 'deposits') {
				setActiveTransactionSectionColor('#a3d5bb75');
			} else if (activeTransactionSection === 'penalties') {
				setActiveTransactionSectionColor('#c1c9eb75');
			}
		}, [activeTransactionSection]);

		// Handle reverse cotisation
		const handleReverseCotisation = async (values) => {
			if (!values || typeof values !== 'object') {
				return warningToast({ message: "Invalid record values" });
			}

			const { id, recordId, savings, comment } = values;

			try {
				setIsWaitingFetchAction(true);

				const payload = {
					savings: savings.slice(1, -1).split(","), comment, recordId
				}

				const response = await fetch(`${BASE_URL}/member/${id}/cotisation/reverse`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error reversing the cotisation record');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchFigures();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error reversing the cotisation record:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
				resetConfirmDialog();
			}
		};

		// Handle edit socal savings
		const handleEditSocalSavings = async (values) => {
			if (!values || typeof values !== 'object') {
				return warningToast({ message: "Invalid record values" });
			}

			const { id, recordId, newSavingAmount } = values;

			try {
				setIsWaitingFetchAction(true);

				const payload = {
					newSavingAmount, recordId
				}

				const response = await fetch(`${BASE_URL}/member/${id}/social/edit`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error updating social savings amount');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchFigures();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error updating social savings amount:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
				resetPrompt();
			}
		};

		// Handle delete socal savings record
		const handleDeleteSocalSavings = async (values) => {
			if (!values || typeof values !== 'object') {
				return warningToast({ message: "Invalid record values" });
			}

			const { id, recordId } = values;

			try {
				setIsWaitingFetchAction(true);

				const payload = {
					recordId
				}

				const response = await fetch(`${BASE_URL}/member/${id}/social/delete`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload),
				});

				// Fetch error
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || 'Error deleting social savings record');
				}

				// Successful fetch
				const data = await response.json();
				successToast({ message: data.message });
				setErrorWithFetchAction(null);
				fetchMembers();
				fetchFigures();
				fetchRecords();
			} catch (error) {
				setErrorWithFetchAction(error.message);
				cError("Error deleting social savings record:", error);
				warningToast({ message: error.message || "An unknown error occurred", type: "danger" });
			} finally {
				setIsWaitingFetchAction(false);
				resetConfirmDialog();
			}
		};

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<div className="d-flex flex-wrap justify-content-between align-items-center">
						<h2 className='text-appColor'><CashRegister weight='fill' className="me-1 opacity-50" /> Transactions panel</h2>
						<div className="ms-auto d-flex gap-1">
							<ToogleButton icon={<Plus />} text='Record expenses' func={() => { setActiveTransactionSection('withdrawals'); setShowAddExpenseRecord(true) }} />
						</div>
					</div>
					<SectionDescription
						imagePath='/images/transactions_visual.png'
						content="The transactions panel provides a detailed record of all financial activities, ensuring complete transparency and accountability. Here, you can track and review logs of deposits, withdrawals/expenses, and penalties, offering a comprehensive view of each member's financial transactions for easy monitoring and management."
					/>
				</div>
				<hr className='mb-4 d-lg-none' />
				<div className='text-gray-700 selective-options' style={{ backgroundColor: activeTransactionSectionColor }}>
					{/* Selectors */}
					<div className="d-flex flex-wrap justify-content-center">
						<div className={`position-relative col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-warning border-opacity-25 tab-selector ${activeTransactionSection === 'withdrawals' ? 'active' : ''} user-select-none ptr`}
							style={{ '--_activeColor': '#f4e4b6' }}
							onClick={() => {
								setActiveTransactionSection('withdrawals');
								setTransactions(
									recordsToShow
										.filter(cr => cr.recordType === 'expense')
										.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
								);
							}}
						>
							<h5 className='mb-0 small'>Expenses</h5>
							<p className='mb-0 fs-75'>( {recordsToShow.filter(cr => cr.recordType === 'expense').length} )</p>
							<Menu menuButton={
								<MenuButton className="border-0 p-0 bg-transparent">
									<CaretDown size={35} weight='light' className='p-2 position-absolute end-0 top-50 translate-middle-y' />
								</MenuButton>
							} transition>
								{expenseTypes.map((item, index) => (
									<MenuItem key={index} onClick={() => {
										setTimeout(() => {
											setTransactions(
												recordsToShow
													.filter(cr => cr.recordType === 'expense' && cr.recordSecondaryType.toLowerCase().includes(item.trim().toLowerCase()))
													.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
											)
										}, 500)
									}} className="small">
										{item}
									</MenuItem>
								))}
							</Menu>
						</div>
						<div className={`position-relative col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-success border-opacity-25 tab-selector ${activeTransactionSection === 'deposits' ? 'active' : ''} user-select-none ptr`}
							style={{ '--_activeColor': '#a3d5bb' }}
							onClick={() => {
								setActiveTransactionSection('deposits');
								setTransactions(
									recordsToShow
										.filter(rc => (rc.recordType === 'deposit' || (rc.recordType === 'loan' && rc.recordSecondaryType === 'payment')))
										.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
								);
							}}
						>
							<h5 className='mb-0 small'>Deposits</h5>
							<p className='mb-0 fs-75'>
								( {
									recordsToShow.filter(rc => rc.recordType === 'deposit').length +
									recordsToShow.filter(rc => rc.recordType === 'loan' && rc.recordSecondaryType === 'payment').length
								} )
							</p>
							<Menu menuButton={
								<MenuButton className="border-0 p-0 bg-transparent">
									<CaretDown size={35} weight='light' className='p-2 position-absolute end-0 top-50 translate-middle-y' />
								</MenuButton>
							} transition>
								<MenuItem onClick={() => {
									setTimeout(() => {
										setTransactions(
											recordsToShow
												.filter(rc =>
													(rc.recordType === 'deposit' && rc.comment.toLowerCase().indexOf('cotisation') !== -1)
													|| (rc.recordType === 'deposit' && rc.comment.toLowerCase().indexOf('umuhigo') !== -1)
												)
												.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
										)
									}, 500)
								}} className="small">
									Shares
								</MenuItem>
								<MenuItem onClick={() => {
									setTimeout(() => {
										setTransactions(
											recordsToShow
												.filter(rc => rc.recordType === 'deposit' && rc.comment.toLowerCase() === 'social')
												.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
										)
									}, 500)
								}} className="small">
									Social
								</MenuItem>
								<MenuItem onClick={() => {
									setTimeout(() => {
										setTransactions(
											recordsToShow
												.filter(rc => rc.recordType === 'loan' && rc.recordSecondaryType === 'payment')
												.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
										)
									}, 500)
								}} className="small">
									Loan payment
								</MenuItem>
								{recordsToShow.filter(rc => rc.recordType === 'deposit').length + recordsToShow.filter(rc => rc.recordType === 'loan' && rc.recordSecondaryType === 'payment').length > 0 && (
									<MenuItem onClick={() => { setTransactions(recordsToShow); }} className="small">
										All
									</MenuItem>
								)}
							</Menu>
						</div>
						<div className={`position-relative col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-primary border-opacity-25 tab-selector ${activeTransactionSection === 'penalties' ? 'active' : ''} user-select-none ptr`}
							style={{ '--_activeColor': '#c1c9eb' }}
							onClick={() => {
								setActiveTransactionSection('penalties');
								setTransactions(
									recordsToShow
										.filter(cr => cr.recordType === 'penalty')
										.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
								);
							}}
						>
							<h5 className='mb-0 small'>Penalties</h5>
							<p className='mb-0 fs-75'>( {recordsToShow.filter(cr => cr.recordType === 'penalty').length} )</p>
						</div>
					</div>

					{/* Selected content */}

					{loadingMembers && (<LoadingIndicator icon={<Users size={80} className="loading-skeleton" />} />)}
					{!loadingMembers && errorLoadingMembers && (
						<FetchError
							errorMessage={errorLoadingMembers}
							refreshFunction={() => fetchMembers()}
							className="mb-5 mt-4"
						/>
					)}
					{!loadingMembers && !errorLoadingMembers && !membersToShow.length && (
						<NotFound
							notFoundMessage="No member found"
							icon={<Users size={80} className="text-center w-100 mb-3 opacity-50" />}
							refreshFunction={fetchMembers}
						/>
					)}
					{!loadingMembers && !errorLoadingMembers && membersToShow.length && (
						<div style={{ minHeight: '60vh' }}>
							{/* Expenses table */}
							{activeTransactionSection === 'withdrawals' && (
								<>
									<div className='overflow-auto'>
										<table className="table table-striped table-hover h-100">
											<thead className='table-warning position-sticky top-0 inx-1 1 text-uppercase small'>
												<tr>
													<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Type</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date</th>
													<th className='py-3 text-center text-nowrap text-gray-700 fw-normal'>Actions</th>
												</tr>
											</thead>
											<tbody>
												{transactions.length > 0 ? (transactions
													.map((record, index) => {

														return (
															<tr key={index} className="small cursor-default">
																<td className="ps-sm-3 border-bottom-3 border-end">
																	{index + 1}
																</td>
																<td>
																	{record.recordSecondaryType}
																</td>
																<td>
																	<CurrencyText amount={Number(record.recordAmount)} />
																</td>
																<td>
																	{(record.comment.indexOf('(') > -1 && record.comment.indexOf(')') > -1) ?
																		record.comment.slice(0, record.comment.indexOf('('))
																		:
																		record.comment
																	}
																</td>
																<td className="text-nowrap" style={{ maxWidth: '13rem' }}>
																	<Popover content={<><Watch size={15} /> {getDateHoursMinutes(record.createdAt)}</>} trigger='hover' placement='top' className='flex-center py-1 px-2 bg-gray-400 text-dark border border-secondary border-opacity-25 text-tuncate smaller shadow-none' arrowColor='var(--bs-gray-400)' height='1.9rem' width='fit-content'>
																		<FormatedDate date={record.createdAt} />
																	</Popover>
																</td>
																<td className='text-center'>
																	<Menu menuButton={
																		<MenuButton className="border-0 p-0 bg-transparent">
																			<DotsThreeVertical size={20} weight='bold' />
																		</MenuButton>
																	} transition>
																		{(record.recordType.toLowerCase() === 'expense') && (
																			<>
																				<MenuItem onClick={() => {
																					customPrompt({
																						message: (
																							<>
																								<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><ReceiptX size={25} weight='fill' className='opacity-50' /> Edit/update expense record</h5>
																								<p>
																									Current amount: <CurrencyText amount={Number(record.recordAmount)} /><br /><br />
																									Enter new expense amount for this record.
																								</p>
																							</>
																						),
																						inputType: 'number',
																						action: () => handleEditExpense({
																							id: record.id,
																							newExpenseAmount: promptInputValue.current
																						}),
																						placeholder: 'Updated amount',
																					})
																				}}>
																					<Pen weight='fill' className="me-2 opacity-50" /> Update
																				</MenuItem>
																				<MenuItem onClick={() => {
																					customConfirmDialog({
																						message: (
																							<>
																								<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><Trash size={25} weight='fill' className='opacity-50' /> Delete expense</h5>
																								<p>
																									This action will undo all transactions associated with this record and permanently remove it from the transaction history.<br /><br />
																									<span className='d-block alert alert-dark'>
																										<b>Expense amount:</b> <CurrencyText amount={Number(record.recordAmount)} /><br />
																										<b>Recorded on:</b> <FormatedDate date={record.createdAt} />.
																									</span>
																								</p>
																							</>
																						),
																						type: 'warning',
																						action: () => handleDeleteExpense(record.id),
																						actionText: "Delete record"
																					});
																				}}>
																					<Trash weight='fill' className="me-2 opacity-50" /> Delete
																				</MenuItem>
																			</>
																		)}
																	</Menu>
																</td>
															</tr>
														)
													})
												) : (
													<tr>
														<td colSpan={6} className="text-center">
															No expense records found.
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>

									{showAddExpenseRecord &&
										<>
											<Overlay
												isSmall={true}
												titleIcon={
													<CashRegister weight='fill' />
												}
												titleText="Record an expense"
												onClose={() => { setShowAddExpenseRecord(false); setExpenseRecordAmount('') }}
												onCloseTitle='Cancel'
												children={
													<>
														{/* The form */}
														<form onSubmit={(e) => handleAddExpense(e)} className="px-sm-2 pb-5">
															<div className="mb-3">
																<label htmlFor="expenseType" className="form-label fw-bold">Expense type</label>
																<select id="expenseType" name="expenseType" className="form-select"
																	value={expenseRecordType}
																	onChange={(e) => setExpenseRecordType(e.target.value)}
																	required>
																	<option value="" disabled className='p-2 px-3 small text-gray-500'>Select type</option>
																	{expenseTypes
																		.map((val, index) => (
																			<option key={index} value={val} className='p-2 px-3 small'>
																				{val}
																			</option>
																		))
																	}
																</select>
															</div>
															<div className="mb-3">
																<label htmlFor="expenseAmount" className="form-label fw-bold" required>Expense amount ({expenseRecordAmount !== '' ? Number(expenseRecordAmount).toLocaleString() : ''} RWF )</label>
																<input type="number" id="expenseAmount" name="expenseAmount" className="form-control" min="1" required placeholder="Enter amount"
																	value={expenseRecordAmount}
																	onChange={e => setExpenseRecordAmount(e.target.value)}
																/>
															</div>
															<div className="mb-3">
																<label htmlFor="expenseComment" className="form-label fw-bold" required>Expense comment</label>
																<textarea rows={3} id="expenseComment" name="expenseComment" className="form-control" placeholder="Enter comment"
																	value={expenseComment}
																	onChange={e => setExpenseComment(e.target.value)}
																></textarea>
															</div>

															<button type="submit" className="btn btn-sm btn-dark flex-center w-100 mt-3 py-2 px-4 rounded-pill clickDown" id="addExpenseBtn"
															>
																{!isWaitingFetchAction ?
																	<>Save Record <FloppyDisk size={18} className='ms-2' /></>
																	: <>Working <SmallLoader color='light' /></>
																}
															</button>
														</form>
													</>
												}
											/>
										</>
									}
								</>
							)}

							{/* Deposits table */}
							{activeTransactionSection === 'deposits' && (
								<div className='overflow-auto'>
									<table className="table table-striped table-hover h-100">
										<thead className='table-success position-sticky top-0 inx-1 1 text-uppercase small'>
											<tr>
												<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal'>Member</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date</th>
												<th className='py-3 text-center text-nowrap text-gray-700 fw-normal'>Actions</th>
											</tr>
										</thead>
										<tbody>
											{transactions.length > 0 ? (transactions
												.map((record, index) => {
													const associatedMember = allMembers?.find(m => m.id === record.memberId);
													const memberNames = `${associatedMember?.husbandFirstName} ${associatedMember?.husbandLastName}`;
													let interestAmount = null;
													if (record.recordType === 'loan' && record.recordSecondaryType === 'payment') {
														interestAmount = Number(JSON.parse(record.comment)?.interestPaid > 0
															? JSON.parse(record.comment)?.interestPaid
															: 0
														);
													}

													return (
														<tr key={index} className="small cursor-default">
															<td className="ps-sm-3 border-bottom-3 border-end">
																{index + 1}
															</td>
															<td className="text-nowrap">
																{memberNames}
															</td>
															<td>
																<CurrencyText amount={Number(record.recordAmount)} />
															</td>
															<td>
																{
																	interestAmount !== null
																		? <>Loan payment (with <CurrencyText amount={interestAmount} /> interest)</>
																		: record.comment
																}
															</td>
															<td className="text-nowrap" style={{ maxWidth: '13rem' }}>
																<Popover content={<><Watch size={15} /> {getDateHoursMinutes(record.createdAt)}</>} trigger='hover' placement='top' className='flex-center py-1 px-2 bg-gray-400 text-dark border border-secondary border-opacity-25 text-tuncate smaller shadow-none' arrowColor='var(--bs-gray-400)' height='1.9rem' width='fit-content'>
																	<FormatedDate date={record.createdAt} />
																</Popover>
															</td>
															<td className='text-center'>
																<Menu menuButton={
																	<MenuButton className="border-0 p-0 bg-transparent">
																		<DotsThreeVertical size={20} weight='bold' />
																	</MenuButton>
																} transition>
																	{record.comment.toLowerCase().indexOf('cotisation') === 0 && (
																		<>
																			<MenuItem onClick={() => {
																				if (record.comment.indexOf('(') === -1) {
																					messageToast({
																						message: "This record cannot be reversed as it does not contain a list of recorded months. Only cotisation records created after this feature was introduced are eligible for reversal.",
																						type: 'primaryColor',
																						selfClose: false
																					});
																				} else {
																					customConfirmDialog({
																						message: (
																							<>
																								<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><ArrowsLeftRight size={25} weight='fill' className='opacity-50' /> Reversing member cotisations</h5>
																								<p>
																									This action will reverse the cotisation record, covering the months listed in the transaction, for the associated member.<br /><br />
																									<span className='d-block alert alert-dark'>
																										<b>Member:</b> {memberNames}<br />
																										<b>Amount:</b> <CurrencyText amount={Number(record.recordAmount)} /><br />
																										<b>Months:</b> {record.comment.slice(record.comment.indexOf('('))}<br />
																										<b>Year:</b> {new Date(record.createdAt).getFullYear()}<br />
																										<b>Recorded on:</b> <FormatedDate date={record.createdAt} />.
																									</span>
																								</p>
																							</>
																						),
																						type: 'warning',
																						action: () => handleReverseCotisation({
																							id: record.memberId,
																							recordId: record.id,
																							savings: record.comment.slice(record.comment.indexOf('(')),
																							comment: record.comment
																						}),
																					});
																				}
																			}}>
																				<ArrowsLeftRight weight='fill' className="me-2 opacity-50" /> Reverse record
																			</MenuItem>
																		</>
																	)}
																	{(record.recordType.toLowerCase() === 'deposit' && record.comment.toLowerCase() === 'social') && (
																		<>
																			<MenuItem onClick={() => {
																				customPrompt({
																					message: (
																						<>
																							<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><ReceiptX size={25} weight='fill' className='opacity-50' /> Edit/update social savings for {memberNames}</h5>
																							<p>
																								Current amount: <CurrencyText amount={Number(record.recordAmount)} /><br /><br />
																								Enter new social amount for this record.
																							</p>
																						</>
																					),
																					inputType: 'number',
																					action: () => handleEditSocalSavings({
																						id: record.memberId,
																						recordId: record.id,
																						newSavingAmount: promptInputValue.current,
																					}),
																					placeholder: 'Updated amount',
																				})
																			}}>
																				<Pen weight='fill' className="me-2 opacity-50" /> Update
																			</MenuItem>
																			<MenuItem onClick={() => {
																				customConfirmDialog({
																					message: (
																						<>
																							<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><Trash size={25} weight='fill' className='opacity-50' /> Delete member social savings</h5>
																							<p>
																								This action will undo all transactions associated with this record and permanently remove it from the transaction history.<br /><br />
																								<span className='d-block alert alert-dark'>
																									<b>Member:</b> {memberNames}<br />
																									<b>Social saving amount:</b> <CurrencyText amount={Number(record.recordAmount)} /><br />
																									<b>Recorded on:</b> <FormatedDate date={record.createdAt} />.
																								</span>
																							</p>
																						</>
																					),
																					type: 'warning',
																					action: () => handleDeleteSocalSavings({
																						id: record.memberId,
																						recordId: record.id,
																					}),
																					actionText: "Delete record"
																				});
																			}}>
																				<Trash weight='fill' className="me-2 opacity-50" /> Delete
																			</MenuItem>
																		</>
																	)}
																	{(record.recordType.toLowerCase() === 'loan' && record.recordSecondaryType.toLowerCase() === 'payment') && (
																		<>
																			<MenuItem onClick={() => {
																				setActiveSection('credits');
																			}}>
																				<Blueprint weight='fill' className="me-2 opacity-50" /> Check payment history
																			</MenuItem>
																		</>
																	)}
																</Menu>
															</td>
														</tr>
													)
												})
											) : (
												<tr>
													<td colSpan={6} className="text-center">
														No deposit records found.
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							)}

							{activeTransactionSection === 'penalties' && (
								<div className='overflow-auto'>
									<table className="table table-striped table-hover h-100">
										<thead className='table-primary position-sticky top-0 inx-1 text-uppercase small'>
											<tr>
												<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ minWidth: '10rem' }}>Member</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal'>Amount  <sub className='fs-60'>/RWF</sub></th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal' style={{ maxWidth: '13rem' }} >Comment</th>
												<th className='py-3 text-nowrap text-gray-700 fw-normal'>Date</th>
												<th className='py-3 text-center text-nowrap text-gray-700 fw-normal'>Actions</th>
											</tr>
										</thead>
										<tbody>
											{transactions.length > 0 ? (transactions
												.map((record, index) => {
													const associatedMember = allMembers?.find(m => m.id === record.memberId);
													const memberNames = `${associatedMember?.husbandFirstName} ${associatedMember?.husbandLastName}`;

													return (
														<tr key={index} className="small cursor-default">
															<td className="ps-sm-3 border-bottom-3 border-end">
																{index + 1}
															</td>
															<td className="text-nowrap">
																{memberNames}
															</td>
															<td>
																<CurrencyText amount={Number(record.recordAmount)} />
															</td>
															<td>
																{record.comment}
															</td>
															<td className="text-nowrap" style={{ maxWidth: '13rem' }}>
																<Popover content={<><Watch size={15} /> {getDateHoursMinutes(record.createdAt)}</>} trigger='hover' placement='top' className='flex-center py-1 px-2 bg-gray-400 text-dark border border-secondary border-opacity-25 text-tuncate smaller shadow-none' arrowColor='var(--bs-gray-400)' height='1.9rem' width='fit-content'>
																	<FormatedDate date={record.createdAt} />
																</Popover>
															</td>
															<td className='text-center'>
																<Menu menuButton={
																	<MenuButton className="border-0 p-0 bg-transparent">
																		<DotsThreeVertical size={20} weight='bold' />
																	</MenuButton>
																} transition>
																	{(record.recordType.toLowerCase() === 'penalty') && (
																		<>
																			<MenuItem onClick={() => {
																				customPrompt({
																					message: (
																						<>
																							<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><ReceiptX size={25} weight='fill' className='opacity-50' /> Edit/update penalty record</h5>
																							<p>
																								Current amount: <CurrencyText amount={Number(record.recordAmount)} /><br /><br />
																								Enter new penalty amount for this record.
																							</p>
																						</>
																					),
																					inputType: 'number',
																					action: () => handleEditPenalty({
																						id: record.id,
																						newPenaltyAmount: promptInputValue.current
																					}),
																					placeholder: 'Updated amount',
																				})
																			}}>
																				<Pen weight='fill' className="me-2 opacity-50" /> Update
																			</MenuItem>
																			<MenuItem onClick={() => {
																				customConfirmDialog({
																					message: (
																						<>
																							<h5 className='h6 border-bottom mb-3 pb-2 text-uppercase'><Trash size={25} weight='fill' className='opacity-50' /> Delete penalty</h5>
																							<p>
																								This action will undo all transactions associated with this record and permanently remove it from the transaction history.<br /><br />
																								<span className='d-block alert alert-dark'>
																									<b>Penalty amount:</b> <CurrencyText amount={Number(record.recordAmount)} /><br />
																									<b>Recorded on:</b> <FormatedDate date={record.createdAt} />.
																								</span>
																							</p>
																						</>
																					),
																					type: 'warning',
																					action: () => handleDeletePenalty(record.id),
																					actionText: "Delete record"
																				});
																			}}>
																				<Trash weight='fill' className="me-2 opacity-50" /> Delete
																			</MenuItem>
																		</>
																	)}
																</Menu>
															</td>
														</tr>
													)
												})
											) : (
												<tr>
													<td colSpan={6} className="text-center">
														No penalty records found.
													</td>
												</tr>
											)}
										</tbody>
									</table>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		)
	}

	// Reports
	const Reports = () => {

		const [showExportDataDialog, setShowExportDataDialog] = useState(false);
		const [exportFileName, setExportFileName] = useState('exported-file');

		const [activeReportSection, setActiveReportSection] = useState('incomeExpenses');
		useEffect(() => {
			if (activeReportSection === 'incomeExpenses') {
				setExportFileName('Rapport sur les revenus et les dépenses');
			} else if (activeReportSection === 'general') {
				setExportFileName('Rapport général');
			}
		}, [activeReportSection]);

		// Count report values
		let totalCredits = 0;
		let totalCotisationsAndShares = 0;
		let generalTotal = Number(allFigures?.balance);

		// Handle exports
		const reportViewRef = useRef();

		// Create income and expenses report

		const expenses = allRecords.filter(r => r.recordType === 'expense');
		const expenseTypes = [];
		const expenseData = [];

		// __Extract different types of expenses
		expenses.forEach(item => {
			const subtype = item.recordSecondaryType;
			if (!expenseTypes.includes(subtype)) {
				expenseTypes.push(subtype);
			}
		});

		// ___Construct { expense : value } array
		expenseTypes.forEach(item => {
			const value = expenses
				.filter(rc => rc.recordSecondaryType === item)
				.reduce((sum, rc) => (sum + Number(rc.recordAmount)), 0);
			expenseData.push({ type: 'expense', label: item, amount: value });
		});

		// __Construct incomes
		const incomesData = [];
		const incomes = [
			{ penalties: Number(allFigures?.penalties) }
		];

		incomes.forEach(item => {
			const [label, value] = Object.entries(item)[0]; // Extract key and value
			incomesData.push({ type: 'income', label, amount: value });
		});

		// __Combine income and expenses
		const incomeExpenses = [...expenseData, ...incomesData];

		return (
			<div className="pt-2 pt-md-0 pb-3">
				<div className="mb-3">
					<h2 className='text-appColor'><Files weight='fill' className="me-1 opacity-50" /> Report panel</h2>
					<SectionDescription
						imagePath='/images/reports_visual.png'
						content="The reports panel provides detailed insights into financial activities, including breakdowns of income and expenses and an overview of members' financial status. It also offers export options for further analysis and use."
					/>
				</div>
				<hr className='mb-4 d-lg-none' />

				<div ref={reportViewRef} className='mb-3 bg-bodi'>
					<div className="alert alert-secondary smaller">
						<p className='display-6'>
							{
								activeReportSection === 'incomeExpenses' ?
									<>Rapport sur les revenus et les dépenses</>
									: activeReportSection === 'general' ?
										<>Rapport général</>
										: 'REPORT'
							}
						</p>
						<Calendar size={25} className='me-2' /> <FormatedDate date={new Date()} monthFormat='numeric' hour12Format={true} />
					</div>
					<div className='text-gray-700 selective-options' style={{ backgroundColor: '#d2d3d375' }}>
						{/* Selectors */}
						<div className="d-flex flex-wrap justify-content-center">
							<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-secondary border-opacity-25 tab-selector ${activeReportSection === 'incomeExpenses' ? 'active' : ''} user-select-none ptr clickDown`}
								style={{ '--_activeColor': '#d2d3d3' }}
								onClick={() => { setActiveReportSection('incomeExpenses'); }}
							>
								<h5 className='mb-0 small'>Income & Expenses</h5>
							</div>
							<div className={`col d-flex flex-column flex-sm-row column-gap-2 p-2 border-top border-bottom border-2 border-secondary border-opacity-25 tab-selector ${activeReportSection === 'general' ? 'active' : ''} user-select-none ptr clickDown`}
								style={{ '--_activeColor': '#d2d3d3' }}
								onClick={() => { setActiveReportSection('general'); }}
							>
								<h5 className='mb-0 small'>General report</h5>
							</div>
						</div>

						{/* Selected content */}
						<div style={{ minHeight: '60vh' }}>
							{activeReportSection === 'incomeExpenses' && (
								<>
									<div className='overflow-auto'>
										<table className="table table-hover h-100">
											<thead className='table-secondary position-sticky top-0 inx-1 1 text-uppercase small'>
												<tr>
													<th className='ps-sm-3 py-3 text-nowrap text-gray-700'>N°</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Libelle</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Montant <sub className='fs-60'>/RWF</sub></th>
												</tr>
											</thead>
											<tbody>
												{/* Sort by Income to Expenses, and low to max amount */}
												{incomeExpenses
													.filter((item) => item.type === 'income')
													.sort((a, b) => a.amount - b.amount)
													.concat(
														incomeExpenses
															.filter((item) => item.type === 'expense')
															.sort((a, b) => a.amount - b.amount)
													)
													.map((item, index) => (
														<tr key={index} className="small cursor-default">
															<td className={`ps-sm-3 border-end ${item.type === 'income' ? 'text-success' : 'text-warning-emphasis'}`}>
																{index + 1}
															</td>
															<td className={`${item.type === 'income' ? 'text-success' : 'text-warning-emphasis'} text-capitalize`}>
																{item.label} {item.label.toLowerCase() === 'social' ? ' expenses' : ''}
															</td>
															<td className={`${item.type === 'income' ? 'text-success' : 'text-warning-emphasis'}`}>
																<CurrencyText amount={item.amount} />
															</td>
														</tr>
													))
												}
											</tbody>
										</table>
									</div>
								</>
							)}

							{activeReportSection === 'general' && (
								<>
									<div className='overflow-auto'>
										<table className="table table-hover h-100">
											<thead className='table-secondary position-sticky top-0 inx-1 1 text-uppercase small'>
												<tr>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Actif</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Montant <sub className='fs-60'>/RWF</sub></th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Passif</th>
													<th className='py-3 text-nowrap text-gray-700 fw-normal'>Montant <sub className='fs-60'>/RWF</sub></th>
												</tr>
											</thead>
											<tbody>
												{activeMembers
													.sort((a, b) => a.husbandFirstName.localeCompare(b.husbandFirstName))
													.map((item, index) => {
														const memberNames = `${item.husbandFirstName} ${item.husbandLastName}`;
														const memberCostisation = item.cotisation;
														const memberSocial = Number(item.social);
														const memberBalance = memberCostisation + memberSocial;

														const memberCredits = allLoans.find(loan => loan.memberId === item.id);
														const pendingCredit = memberCredits.loanPending;
														const pendingInterest = memberCredits.interestPending;

														totalCredits += pendingCredit + pendingInterest;
														totalCotisationsAndShares += memberBalance;
														generalTotal += pendingCredit + pendingInterest;

														return (
															<tr key={index} className="small cursor-default general-report-row">
																<td className="ps-sm-3">
																	<b>{index + 1}</b>. {memberNames}
																</td>
																<td className="text-nowrap">
																	Credit: <CurrencyText amount={pendingCredit + pendingInterest} boldAmount smallCurrency className='text-gray-700' />
																</td>
																<td>
																	{memberNames}
																</td>
																<td className='text-nowrap'>
																	Part: <CurrencyText amount={memberCostisation} boldAmount smallCurrency className='text-gray-700' /> | Social: <CurrencyText amount={Number(memberSocial)} boldAmount smallCurrency className='text-gray-700' />
																</td>
															</tr>
														)
													})
												}
												<tr className="small cursor-default general-report-row fw-bold opacity-75" style={{ borderTopWidth: '2px' }} >
													<td className="ps-sm-3 border-end">Total credits</td>
													<td>
														<CurrencyText amount={totalCredits} />
													</td>
													<td className="border-end">
														Cotisation + Social
													</td>
													<td className="text-nowrap">
														<CurrencyText amount={totalCotisationsAndShares} />
													</td>
												</tr>
												<tr className="small cursor-default general-report-row" style={{ borderBottomWidth: '2px' }}>
													<td className="ps-sm-3 border-end fw-bold opacity-75">
														Balance
													</td>
													<td className="text-nowrap fw-bold opacity-75">
														<CurrencyText amount={Number(allFigures?.balance)} />
													</td>
													<td className="border-end">
														Verify
													</td>
													<td className={`text-nowrap ${generalTotal - totalCotisationsAndShares < 0 ? 'text-danger' : 'text-primary'}`}>
														<CurrencyText amount={generalTotal - totalCotisationsAndShares} />
													</td>
												</tr>
												<tr className="small cursor-default general-report-row fs-5 fw-bold opacity-75">
													<td className="ps-sm-3">General Total:</td>
													<td>
														<CurrencyText amount={generalTotal} /> {/* Must be equal */}
													</td>
													<td>General Total:</td>
													<td className="text-nowrap">
														<CurrencyText amount={generalTotal} /> {/* Must be equal */}
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</>
							)}
							<div className="d-flex small px-2">
								<CashRegister size={30} weight='duotone' className='me-2 opacity-50' />
								<div className='border-start border-secondary border-opacity-25 ps-2'>
									<p className='mb-0'>Created using IKIMINA INGOBOKA system</p>
									<p>Done by <b>Accountant {accountantNames}</b></p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Exporter */}
				<div className='small'>
					<div className="d-flex flex-wrap gap-2">
						<button className="btn btn-sm bg-primaryColor text-light rounded-0 clickDown"
							onClick={() => setShowExportDataDialog(true)}
						>
							<Files size={22} /> Generate Report
						</button>
						<p className='mb-0 p-2 smaller'>
							<Info className='me-1' />
							Click the button to generate today's <b>{
								activeReportSection === 'incomeExpenses' ?
									'income and expenses'
									: activeReportSection === 'general' ?
										'general'
										: ''
							}</b> report.
						</p>
					</div>
				</div>

				{/* Export report tables */}
				<ExportDomAsFile
					show={showExportDataDialog}
					container={reportViewRef}
					exportName={exportFileName}
					onClose={() => { setShowExportDataDialog(false) }}
				/>

				{/* Export database */}
				{/* <div className="d-flex flex-wrap gap-2 my-5">
					<button className="btn btn-sm bg-primaryColor flex-align-center text-light rounded-0 clickDown" onClick={() => handelExportDatabase()}>
						Export database {!isWaitingFetchAction ? <Export size={18} className="ms-2" />
							: <SmallLoader color="light" />
						}
					</button>
					<p className='mb-0 p-2 smaller'>
						<Info className='me-1' />
						Click the button to backup current data that is into the database.
					</p>
				</div> */}
			</div>
		)
	}

	// Settings
	const Settings = () => {
		return (
			<SystemSettings data={allSettings}
				userType={userType}
				refresh={() => refreshAllData()}
				startLoading={() => setIsWaitingFetchAction(true)}
				stopLoading={() => setIsWaitingFetchAction(false)}
			/>
		)
	}

	// Audit Log
	const AuditLogs = () => {
		return (
			<>
				<section>
					- Track changes made by admins or staff to maintain transparency.
					- Log edits to member details, savings, loans, or settings.
				</section>
				{/* <DateLocaleFormat /> */}
				<JsonJsFormatter />
			</>
		)
	}

	// Render content
	const renderContent = () => {
		switch (activeSection) {
			case "dashboard":
				return <Dashboard />;
			case "members":
				return <Members />;
			case "savings":
				return <Savings />;
			case "interest":
				return <Interest />;
			case "credits":
				return <Credit />;
			case "transactions":
				return <Transactions />;
			case "reports":
				return <Reports />;
			case "settings":
				return <Settings />;
			case "auditLogs":
				return <AuditLogs />;
			default:
				return <Dashboard />;
		}
	};

	// Set notifications

	const [showNotifications, setShowNotifications] = useState(false);
	const [hasNewNotifications, setHasNewNotifications] = useState(false);

	useEffect(() => {
		if (allCredits.filter(cr => cr.status === 'pending').length) {
			setHasNewNotifications(true);
		} else {
			setHasNewNotifications(false);
		}
	}, [allCredits]);

	useEffect(() => {
		if (hasNewNotifications) {
			messageToast({
				message: <>
					<div className="flex-center">
						You have new notifications <ArrowSquareOut size={20} weight='bold' className='ms-2 text-warning ptr clickDown'
							onClick={() => { setShowNotifications(true); resetToast() }}
						/>
					</div>
				</>,
				type: 'primaryColor'
			});
		}
	}, [hasNewNotifications]);

	return (
		<>
			{/* Toast message */}
			<MyToast show={showToast} message={toastMessage} type={toastType} selfClose={toastSelfClose} selfCloseTimeout={toastSelfCloseTimeout} onClose={resetToast} />

			{/* Prompt actions */}
			<ActionPrompt
				show={showPrompt}
				// isStatic
				message={promptMessage}
				type={promptType}
				inputType={promptInputType}
				selectInputOptions={promptSelectInputOptions}
				promptInputValue={promptInputValue}
				inputPlaceholder={promptInputPlaceholder}
				action={() => { promptAction(); setPromptActionWaiting(true); }}
				actionIsWaiting={promptActionWaiting}
				onClose={resetPrompt}
			/>

			{/* Dialog actions */}
			<ConfirmDialog
				show={showConfirmDialog}
				message={confirmDialogMessage}
				type={confirmDialogType}
				action={() => { confirmDialogAction(); setConfirmDialogActionWaiting(true); }}
				actionText={confirmDialogActionText}
				actionIsWaiting={confirmDialogActionWaiting}
				closeText={confirmDialogCloseText}
				onClose={resetConfirmDialog}
				onCloseCallback={confirmDialogCloseCallback}
			/>

			{/* Ongoing/unsettled fetch indicator */}
			{isWaitingFetchAction && (
				<div className='position-fixed fixed-top inset-0 bg-black3 flex-center py-md-3 px-lg-5 inx-high'>
					<LoadingIndicator loaderColor="gray-200" />
				</div>
			)}

			{(!loading && (!userType || userType !== 'admin')) ? (
				<div className="container my-5">
					<h1 className="text-center text-secondary mb-5">Access forbidden</h1>
					<div className='text-center'>
						<p>
							The page you are trying to reach either does not exist or you have limited access on its content.
						</p>
						<button
							className="btn text-primary rounded-0 col-12 col-sm-8 col-md-6"
							onClick={() => { navigate('/login', { replace: true }) }}
						>
							Login <CaretRight />
						</button>
					</div>
				</div>
			) : (
				<>
					<header className="navbar navbar-light sticky-top flex-md-nowrap py-0 admin-header">
						<div className='nav-item navbar-brand position-relative col-12 col-md-3 col-xl-2 d-flex align-items-center me-0 px-2'>
							<div className="me-2 logo">
								<img src='/logo.jpg' alt="" className="rounded-circle logo p-2"></img>
							</div>
							<small className='fs-70 org-name'>
								INGOBOKA
							</small>
							<div className="d-flex gap-2 d-md-none ms-auto me-2 nav-actions" style={{ '--_activeColor': 'var(--bs-gray-500)' }}>
								<button className={`nav-link px-2 ${hasNewNotifications ? 'active-with-dot' : ''} rounded-0 clickDown`} title='Notifications'
									onClick={() => setShowNotifications(true)}
								>
									<BellSimple weight={hasNewNotifications ? 'fill' : undefined} size={20}
										style={{ animation: hasNewNotifications ? 'shakeX 10s infinite' : 'unset' }}
									/>
								</button>
								<button ref={sideNavbarTogglerRef} className="rounded-0 shadow-none bounceClick navbar-toggler" type="button" aria-controls="sidebarMenu" aria-label="Toggle navigation" onClick={() => setSideNavbarIsFloated(!sideNavbarIsFloated)}>
									<List />
								</button>
							</div>
							<Popover content="Balance" trigger='hover' placement='bottom' className='py-1 px-2 smaller shadow-none bg-light text-gray-800 border border-light' arrowColor='var(--bs-light)' height='1.9rem'>
								<div className="position-absolute start-50 top-100 translate-middle flex-align-center gap-1 mt-md-1 px-3 py-1 rounded-pill fs-50 shadow-sm ptr clickDown inx-1 balance-indicator"
									onClick={() => { setActiveSection("dashboard"); }}
								>
									<Wallet size={14} weight='fill' /><CurrencyText amount={Number(allFigures?.balance)} style={{ lineHeight: 1 }} />
								</div>
							</Popover>
						</div>
						<div className='d-none d-md-flex flex-grow-1 border-bottom py-1'>
							<div className="me-3 ms-auto navbar-nav">
								<div className="nav-item d-flex gap-2 text-nowrap small" style={{ '--_activeColor': 'var(--primaryColor)' }}>
									<Popover content="Refresh data" trigger='hover' placement='bottom' className='py-1 px-2 smaller shadow-none border border-secondary border-opacity-25' arrowColor='var(--bs-gray-400)' height='1.9rem'>
										<button className={`nav-link px-2 text-gray-700 rounded-pill clickDown`}
											onClick={refreshAllData}
										>
											<ArrowsClockwise size={20} />
										</button>
									</Popover>
									<Popover content="Notifications" trigger='hover' placement='bottom' className='py-1 px-2 smaller shadow-none border border-secondary border-opacity-25' arrowColor='var(--bs-gray-400)' height='1.9rem'>
										<button className={`nav-link px-2 ${hasNewNotifications ? 'bg-gray-300 text-primaryColor active-with-dot' : 'text-gray-700'} rounded-pill clickDown`}
											onClick={() => setShowNotifications(true)}
										>
											<BellSimple weight={hasNewNotifications ? 'fill' : undefined} size={20}
												style={{ animation: hasNewNotifications ? 'shakeX 10s infinite' : 'unset' }}
											/>
										</button>
									</Popover>
								</div>
							</div>
							<div className="d-flex align-items-center me-3 border-light border-opacity-25">
								<div className='d-grid pb-1'>
									<span className='ms-auto smaller'>{accountantNames}</span>
									<span className='ms-auto fs-70 opacity-75' style={{ lineHeight: 1 }}>Accountant</span>
								</div>
								<Menu menuButton={
									<MenuButton className="border-0 p-0 bg-transparent">
										<img src='/images/man_avatar_image.jpg' alt="" className='w-2_5rem ratio-1-1 object-fit-cover ms-2 d-none d-md-block border border-3 border-light bg-light rounded-circle ptr' />
									</MenuButton>
								} transition>
									<MenuItem onClick={() => { setActiveSection('settings') }}>
										<Gear weight='fill' className="me-2 opacity-50" /> Settings
									</MenuItem>
									<MenuDivider />
									<MenuItem onClick={() => { logout() }}>
										<SignOut weight='fill' className="me-2 opacity-50" /> Sign out
									</MenuItem>
								</Menu>
							</div>
						</div>
					</header>
					<main className="container-fluid">
						{/* Member primary info preview */}
						<RightFixedCard
							show={showNotifications}
							onClose={() => setShowNotifications(false)}
							title="Notifications"
							icon={<BellSimple size={20} weight="fill" className='text-gray-700' />}
							content={
								<>
									{!allCredits.filter(cr => cr.status === 'pending').length ? (
										<EmptyBox
											notFoundMessage="All clear. Any new notifications will show up here."
											fluid
											className="mt-5"
										/>
									) : (
										<>
											{allCredits
												.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
												.filter(cr => cr.status === 'pending')
												.map((cr, index) => {
													const associatedMember = allMembers?.find(m => m.id === cr.memberId);
													const names = `${associatedMember?.husbandFirstName} ${associatedMember?.husbandLastName}`;

													return (
														<div key={index} className="d-flex mb-2 py-2 border-bottom">
															<PersonAvatar
																type='man'
																data={associatedMember}
																size='2rem'
																bordered={false}
																className='flex-grow-0 flex-shrink-0 me-2'
															/>
															<div>
																<div className="d-flex align-items-center justify-content-between mb-1 pb-1 border-bottom text-primaryColor small">
																	<span>Loan request</span>
																	<small className='text-gray-600'>
																		{formatDate(cr.updatedAt, { todayKeyword: true })}
																	</small>
																</div>
																<p className='mb-1 fs-75 text-gray-600'>
																	{names} is requesting a loan of <CurrencyText amount={Number(cr.creditAmount)} />
																</p>
																<button className='btn btn-sm pe-1 fs-60 rounded-pill bg-primaryColor text-light clickDown' style={{ paddingBlock: '.125rem' }}
																	onClick={() => { setActiveSection('credits'); setShowNotifications(false); }}
																>Respond <CaretRight /></button>
															</div>
														</div>
													)
												})
											}
										</>
									)}
								</>
							}
							fitWidth={true}
						/>

						<div className="row">
							{/* Sidebar Navigation */}
							<nav className={`col-12 col-md-3 col-xl-2 px-3 px-sm-5 px-md-0 d-md-block overflow-y-auto sidebar ${sideNavbarIsFloated ? 'floated' : ''}`} id="sidebarMenu">
								<div ref={sideNavbarRef} className={`position-sticky top-0 h-fit my-3 mb-md-0 py-3 col-8 col-sm-5 col-md-12 ${sideNavbarIsFloated ? 'rounded-4' : ''}`}>
									<div className="d-flex align-items-center justify-content-between d-md-none mb-3 px-3 pb-2">
										<div className="d-flex align-items-center">
											<img src='/images/man_avatar_image.jpg' alt="" className='w-2_5rem ratio-1-1 object-fit-cover me-2 border border-3 border-secondary bg-gray-600 rounded-circle' />
											<div className='d-grid pb-1'>
												<span className='smaller'>{accountantNames}</span>
												<span className='fs-70 opacity-75' style={{ lineHeight: 1 }}>Accountant</span>
											</div>
										</div>
										<button type="button" className='btn text-light' onClick={() => setSideNavbarIsFloated(false)}><X size={25} /></button>
									</div>

									<ul className="nav flex-column px-md-1">
										<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'dashboard' ? 'active blur-bg-2px' : ''}`}
											onClick={() => { setActiveSection("dashboard"); hideSideNavbar() }}
										>
											<button className="nav-link w-100">
												<ChartPieSlice size={20} weight='fill' className="me-2" /> Dashboard
											</button>
										</li>
										<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'members' ? 'active blur-bg-2px' : ''}`}
											onClick={() => { setActiveSection("members"); hideSideNavbar() }}
										>
											<button className="nav-link w-100">
												<Users size={20} weight='fill' className="me-2" /> Members
											</button>
										</li>
										<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'savings' ? 'active blur-bg-2px' : ''}`}
											onClick={() => { setActiveSection("savings"); hideSideNavbar() }}
										>
											<button className="nav-link w-100">
												<Coin size={20} weight='fill' className="me-2" /> Savings
											</button>
										</li>
										<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'credits' ? 'active blur-bg-2px' : ''}`}
											onClick={() => { setActiveSection("credits"); hideSideNavbar() }}
										>
											<button className="nav-link w-100">
												<Blueprint size={20} weight='fill' className="me-2" /> Credits
											</button>
											{hasNewNotifications && (
												<span
													className='r-middle-m h-1rem flex-center me-3 px-2 bg-gray-300 text-gray-900 fs-60 fw-medium rounded-pill'
													style={{ lineHeight: 1 }}>
													{allCredits.filter(cr => cr.status === 'pending').length}
												</span>
											)}
										</li>
										<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'transactions' ? 'active blur-bg-2px' : ''}`}
											onClick={() => { setActiveSection("transactions"); hideSideNavbar() }}
										>
											<button className="nav-link w-100">
												<CashRegister size={20} weight='fill' className="me-2" /> Transactions
											</button>
										</li>
										<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'interest' ? 'active blur-bg-2px' : ''}`}
											onClick={() => { setActiveSection("interest"); hideSideNavbar() }}
										>
											<button className="nav-link w-100">
												<Coins size={20} weight='fill' className="me-2" /> Interest
											</button>
										</li>
										<li className={`nav-item mx-4 mx-sm-5 mx-md-2 ${activeSection === 'reports' ? 'active blur-bg-2px' : ''}`}
											onClick={() => { setActiveSection("reports"); hideSideNavbar() }}
										>
											<button className="nav-link w-100">
												<Files size={20} weight='fill' className="me-2" /> Reports
											</button>
										</li>
										{/* <li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'messages' ? 'active blur-bg-2px' : ''}`}
									onClick={() => { setActiveSection("messages"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<ChatDots size={20} weight='fill' className="me-2" /> Messages
									</button>
									<span
										className='r-middle-m h-1rem flex-center me-3 px-2 bg-gray-300 text-gray-900 fs-60 fw-medium rounded-pill'
										style={{ lineHeight: 1 }}>
										5
									</span>
								</li> */}

										<hr />

										{/* <li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'auditLogs' ? 'active blur-bg-2px' : ''}`}
									onClick={() => { setActiveSection("auditLogs"); hideSideNavbar() }}
								>
									<button className="nav-link w-100">
										<Notebook size={20} weight='fill' className="me-2" /> Audit Logs
									</button>
								</li> */}

										<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-2 ${activeSection === 'settings' ? 'active blur-bg-2px' : ''}`}
											onClick={() => { setActiveSection("settings"); hideSideNavbar() }}
										>
											<button className="nav-link w-100">
												<Gear size={20} weight='fill' className="me-2" /> Settings
											</button>
										</li>

										<li className={`nav-item mx-4 mx-sm-5 mx-md-2 mb-3 d-md-none clickDown`} onClick={() => { logout() }}>
											<button className="nav-link w-100">
												<SignOut size={20} weight='fill' className="me-2" /> Sign out
											</button>
										</li>
									</ul>
								</div>
							</nav>

							{/* Content Area */}
							<div className="col-md-9 col-xl-10 ms-sm-auto px-md-4 pt-4 pt-md-2 pb-2">
								{renderContent()}
							</div>
						</div>
					</main>
				</>
			)}
		</>
	)
}

export default Admin;
