import deliveryMan from "./deliveryMan.svg";
import businessman from "./businessman.svg";
import scooter from "./scooter.svg";
import bicycle from "./bicycle.svg";
import motorcycle from "./motorcycle.svg";
import car from "./car.svg";
import bus from "./bus.svg";
import truck from "./truck.svg";
import train from "./train.svg";
import boat from "./boat.svg";
import pin from "./pin.svg";
import drone from "./drone.svg";
import helicopter from "./helicopter.svg";
import defaultIcon from "./default.svg";
import { UserIcons } from "../../types";

const userIcons = {
  pin: {
    key: "pin",
    svg: pin,
    scale: 0.2,
    anchorX: 0,
    anchorY: 194,
    path:
      "M191.495,55.511L137.449,1.465c-1.951-1.953-5.119-1.953-7.07,0l-0.229,0.229c-3.314,3.313-5.14,7.72-5.14,12.406 c0,3.019,0.767,5.916,2.192,8.485l-56.55,48.533c-4.328-3.868-9.852-5.985-15.703-5.985c-6.305,0-12.232,2.455-16.689,6.913 l-0.339,0.339c-1.953,1.952-1.953,5.118,0,7.07l32.378,32.378l-31.534,31.533c-0.631,0.649-15.557,16.03-25.37,28.27	c-9.345,11.653-11.193,13.788-11.289,13.898c-1.735,1.976-1.639,4.956,0.218,6.822c0.973,0.977,2.256,1.471,3.543,1.471	c1.173,0,2.349-0.41,3.295-1.237c0.083-0.072,2.169-1.885,13.898-11.289c12.238-9.813,27.619-24.74,28.318-25.421l31.483-31.483	l30.644,30.644c0.976,0.977,2.256,1.465,3.535,1.465s2.56-0.488,3.535-1.465l0.339-0.339c4.458-4.457,6.913-10.385,6.913-16.689	c0-5.851-2.118-11.375-5.985-15.703l48.533-56.55c2.569,1.425,5.466,2.192,8.485,2.192c4.687,0,9.093-1.825,12.406-5.14l0.229-0.229	C193.448,60.629,193.448,57.463,191.495,55.511z",
  },
  deliveryMan: {
    key: "deliveryMan",
    svg: deliveryMan,
    scale: 0.1,
    anchorX: 225,
    anchorY: 450,
    path:
      "M306.079,223.021c-0.632-7.999-7.672-14.605-15.694-14.728l-53.093-0.814c-3.084-0.047-6.21-2.762-6.689-5.809 l-11.698-74.37c-0.424-2.694-2.936-13.678-16.649-13.678l-66.024,2.875c-8.698,0.378-15.769,4.607-15.769,16.476	c0,0-0.278,165.299-0.616,171.289l-2.31,40.898c-0.309,5.462-2.437,14.303-4.647,19.306l-26.724,60.487	c-1.764,3.991-1.735,8.403,0.08,12.105s5.284,6.428,9.52,7.48l8.897,2.208c1.324,0.329,2.71,0.495,4.118,0.495 c7.182,0,14.052-4.168,17.096-10.372l25.403-51.78c2.806-5.719,6.298-15.412,7.786-21.607l14.334-59.711l34.689,53.049 c2.86,4.374,5.884,12.767,6.471,17.961l6.706,59.392c0.954,8.454,8.654,15.332,17.164,15.332l10.146-0.035	c4.353-0.015,8.311-1.752,11.145-4.893c2.833-3.14,4.158-7.254,3.728-11.585l-7.004-70.612c-0.646-6.512-2.985-16.401-5.325-22.513 l-31.083-81.187l-0.192-17.115l72.241-2.674c4.033-0.149,7.718-1.876,10.376-4.862c2.658-2.985,3.947-6.845,3.629-10.873	L306.079,223.021z M238.43,444.503L238.43,444.503v0.002V444.503z M157.338,97.927c5.558,0,11.054-0.948,16.335-2.819c12.327-4.362,22.216-13.264,27.846-25.066 c3.981-8.345,5.483-17.433,4.486-26.398l16.406-1.851c5.717-0.645,11.52-5.205,13.498-10.607l5.495-15.007	c1.173-3.206,0.864-6.45-0.849-8.902c-1.67-2.39-4.484-3.761-7.72-3.761c-0.375,0-0.763,0.018-1.161,0.056l-47.438,4.512 C176.416,2.933,167.116,0,157.333,0c-5.556,0-11.05,0.947-16.333,2.816c-12.326,4.365-22.215,13.268-27.846,25.07 s-6.328,25.089-1.963,37.413C118.102,84.815,136.647,97.927,157.338,97.927z M364.605,174.546l-4.72-67.843c-0.561-8.057-7.587-14.611-15.691-14.611l-90.689,0.158 c-4.06,0.007-7.792,1.618-10.509,4.536c-2.716,2.917-4.058,6.754-3.775,10.805l4.72,67.843c0.561,8.057,7.587,14.611,15.664,14.611	l90.716-0.158c4.06-0.007,7.792-1.617,10.509-4.535C363.546,182.434,364.887,178.596,364.605,174.546z M259.604,185.044 L259.604,185.044L259.604,185.044L259.604,185.044z",
  },
  businessman: {
    key: "businessman",
    svg: businessman,
    scale: 0.1,
    anchorX: 247.5,
    anchorY: 495,
    path:
      "M243.821,96.484c26.649,0,48.246-21.594,48.246-48.239C292.067,21.594,270.47,0,243.821,0	c-26.642,0-48.245,21.594-48.245,48.245C195.576,74.89,217.179,96.484,243.821,96.484z M372.116,319.32h-3.126v-27.685c5.787-5.924,7.736-14.936,4.095-22.915L304.29,117.996	c-3.776-8.294-12.334-12.613-20.929-11.694h-79.08c-8.607-0.919-17.152,3.399-20.934,11.694l-68.801,150.725 c-4.726,10.363-0.159,22.608,10.201,27.338c2.777,1.266,5.695,1.87,8.546,1.87c7.834,0,15.332-4.481,18.795-12.074l33.239-72.833 l-0.049,256.919c0,13.677,11.077,24.757,24.76,24.757c13.683,0,24.76-11.08,24.76-24.757v-147.55h18.054v147.55 c0,13.677,11.071,24.757,24.76,24.757c13.683,0,24.76-11.08,24.76-24.757l-0.067-256.919l33.257,72.833	c1.87,4.125,4.996,7.231,8.668,9.303v24.163h-3.127c-5.462,0-9.894,4.432-9.894,9.897v103.485c0,5.465,4.432,9.897,9.894,9.897 h31.013c5.469,0,9.901-4.432,9.901-9.897V329.217C382.017,323.752,377.584,319.32,372.116,319.32z M260.913,218.502l-13.205,25.168	c-0.772,1.443-2.256,2.348-3.899,2.348c-1.612,0-3.127-0.904-3.868-2.355l-13.223-25.161c-0.773-1.46-1.141-3.065-1.128-4.718	c0.128-10.838,1.226-53.557,9.207-72.511l-6.112-6.128c-1.722-1.716-1.722-4.487,0-6.204l12.028-12.034	c1.71-1.716,4.481-1.716,6.204,0l12.04,12.034c0.828,0.821,1.293,1.94,1.293,3.102c0,1.162-0.466,2.281-1.293,3.102l-6.124,6.128 c7.994,18.954,9.079,61.673,9.208,72.511C262.053,215.421,261.666,217.049,260.913,218.502z",
  },
  scooter: {
    key: "scooter",
    svg: scooter,
    scale: 0.1,
    anchorX: 256,
    anchorY: 512,
    path:
      "M437.333,291.329c-41.173,0-74.667,33.493-74.667,74.667s33.493,74.667,74.667,74.667S512,407.169,512,365.996 S478.507,291.329,437.333,291.329z M437.333,397.996c-17.643,0-32-14.357-32-32s14.357-32,32-32c17.643,0,32,14.357,32,32 S454.976,397.996,437.333,397.996z M187.477,341.1c-1.493-4.267-5.525-7.104-10.048-7.104h-60.096c17.643,0,32,14.357,32,32s-14.357,32-32,32	c-17.643,0-32-14.357-32-32s14.357-32,32-32H57.259c-4.523,0-8.555,2.837-10.048,7.104c-3.072,8.619-4.544,16.747-4.544,24.896 c0,41.173,33.493,74.667,74.667,74.667c41.173,0,74.667-33.493,74.667-74.667C192,357.846,190.528,349.718,187.477,341.1z M224,184.662H74.667c-17.643,0-32,14.357-32,32c0,17.643,14.357,32,32,32H224c17.643,0,32-14.357,32-32 C256,199.02,241.643,184.662,224,184.662z M334.784,206.806c-5.419-2.24-11.669,0.299-13.952,5.739l-53.333,128c-2.261,5.44,0.299,11.691,5.739,13.952 c1.344,0.576,2.731,0.832,4.096,0.832c4.181,0,8.128-2.475,9.856-6.571l53.333-128 C342.784,215.318,340.224,209.068,334.784,206.806z M218.944,273.793c-2.027-2.411-5.013-3.797-8.171-3.797H74.667c-12.395,0-24.171-4.395-34.069-12.715 c-4.331-3.627-10.752-3.264-14.635,0.853c-2.027,2.133-3.925,4.331-5.696,6.485C7.189,280.705,0,301.548,0,323.329	c0,17.643,14.357,32,32,32h170.667c5.547,0,10.176-4.245,10.624-9.771c0.021-0.341,2.901-33.963,8-63.061	C221.824,279.404,220.971,276.204,218.944,273.793z M361.493,95.318c-10.709,2.133-17.109,13.163-13.653,23.509l0.043,0.107c2.453,7.403,9.387,12.395,17.195,12.395H384 l10.667-42.667L361.493,95.318z M402.389,81.302c-2.539-2.645-6.251-3.819-9.813-3.093l-33.195,6.635c-8.107,1.621-15.125,6.656-19.264,13.803 c-4.139,7.147-5.013,15.723-2.368,23.659c3.925,11.776,14.912,19.691,27.328,19.691H384c4.885,0,9.152-3.328,10.347-8.085 l10.667-42.667C405.909,87.702,404.907,83.948,402.389,81.302z M375.68,120.662h-10.603c-3.221,0-6.08-2.069-7.125-5.227 c-0.939-2.773-0.021-5.013,0.619-6.101c0.619-1.088,2.112-3.008,4.992-3.584l16.661-3.328L375.68,120.662z M437.333,248.662c-23.061,0-32.277-24-32.875-25.536l-56.363-131.52c-6.485-15.168-22.763-23.232-38.848-19.264 c-9.003,2.24-16.725,8.213-21.184,16.341c-4.459,8.128-5.355,17.856-2.411,26.667l10.645,31.957l29.184-17.515 c5.077-3.029,11.605-1.387,14.635,3.648c3.029,5.056,1.387,11.605-3.648,14.635l-33.237,19.947l17.323,51.989 c0.405,1.195,1.003,2.304,1.771,3.285l19.115,23.915c9.259,11.563,9.493,27.648,0.597,39.147 c-6.037,7.787-10.901,15.851-14.485,23.957c-4.373,9.92-3.456,21.291,2.496,30.4c5.952,9.131,16,14.592,26.859,14.592h16.427 c5.888,0,10.667-4.779,10.667-10.667c0-2.197-0.811-4.117-1.963-5.803l46.571-31.04c1.856,2.773,4.821,4.757,8.427,4.864 c21.504,0.661,59.307,0,70.315-10.688c3.008-2.923,4.651-6.72,4.651-10.645C512,269.356,469.931,248.662,437.333,248.662z M329.131,115.158c-3.029-5.035-9.557-6.699-14.635-3.648l-53.333,32c-5.035,3.029-6.677,9.579-3.648,14.635 c2.005,3.349,5.525,5.184,9.152,5.184c1.877,0,3.776-0.491,5.483-1.536l53.333-32C330.517,126.764,332.16,120.193,329.131,115.158 z M277.333,333.996h-74.667c-5.888,0-10.667,4.779-10.667,10.667c0,5.888,4.779,10.667,10.667,10.667h74.667 c5.888,0,10.667-4.779,10.667-10.667C288,338.774,283.221,333.996,277.333,333.996z",
  },
  bicycle: {
    key: "bicycle",
    svg: bicycle,
    scale: 0.1,
    anchorX: 256,
    anchorY: 256,
    path:
      "M407.531,206.527c-13.212,0-25.855,2.471-37.501,6.966c-9.124-20.276-17.007-41.719-20.944-61.668	c-6.323-32.038-34.634-55.291-67.318-55.291c-8.284,0-15,6.716-15,15s6.716,15,15,15c3.569,0,7.044,0.498,10.355,1.423 c10.063,2.812,18.602,9.618,23.582,18.758c-0.403,0.512-0.787,1.043-1.128,1.618l-4.66,7.845l-23.576,39.69H160.377l-7.16-18.021 h2.972c8.284,0,15-6.716,15-15s-6.716-15-15-15H104.47c-8.284,0-15,6.716-15,15s6.716,15,15,15h16.466l13.09,32.944	c-9.376-2.77-19.294-4.265-29.556-4.265C46.865,206.527,0,253.392,0,310.996s46.865,104.469,104.469,104.469 c52.511,0,96.091-38.946,103.388-89.469h27.547c5.292,0,10.193-2.789,12.896-7.339l78.827-132.706	c4.624,14.31,10.412,28.648,16.651,42.346c-24.747,19.122-40.716,49.079-40.716,82.7c0,57.604,46.865,104.469,104.469,104.469 S512,368.601,512,310.997S465.135,206.527,407.531,206.527z M104.469,325.996h72.951c-6.96,33.897-37.025,59.469-72.951,59.469 C63.407,385.464,30,352.058,30,310.996c0-41.062,33.407-74.469,74.469-74.469c35.926,0,65.991,25.572,72.951,59.469h-72.951 c-8.284,0-15,6.716-15,15S96.185,325.996,104.469,325.996z M226.867,295.996h-19.01c-3.481-24.099-15.216-45.561-32.241-61.421 c-0.156-0.602-0.337-1.202-0.573-1.795l-2.746-6.911h96.225L226.867,295.996z M407.531,385.464	c-41.063,0-74.469-33.407-74.469-74.469c0-21.753,9.378-41.355,24.301-54.983c18.448,35.256,36.467,61.538,37.823,63.504 c2.911,4.217,7.594,6.48,12.358,6.48c2.938,0,5.907-0.862,8.508-2.657c6.818-4.706,8.53-14.048,3.824-20.866 c-0.323-0.468-18.475-26.939-36.652-61.853c7.624-2.641,15.797-4.095,24.307-4.095c41.062,0,74.469,33.407,74.469,74.469 C482,352.056,448.593,385.464,407.531,385.464z",
  },
  motorcycle: {
    key: "motorcycle",
    svg: motorcycle,
    scale: 0.1,
    anchorX: 256,
    anchorY: 512,
    path:
      "M422,256c-12.318,0-25.604,3.001-36.872,8.101l-13.685-20.407C390.901,232.431,413.343,226,437,226	c8.291,0,15-6.709,15-15v-30c0-57.891-47.109-105-105-105h-30c-8.291,0-15,6.709-15,15s6.709,15,15,15h15v30h-45 c-5.01,0-9.697,2.505-12.48,6.68L258.972,166h-125.95l-7.529-11.294C117.686,142.987,104.619,136,90.557,136H15 c-8.291,0-15,6.709-15,15c0,38.54,29.224,70.386,66.665,74.546l20.499,30.742C38.875,257.827,0,297.343,0,346 c0,49.629,40.371,90,90,90c38.383,0,72.081-24.646,84.635-60h90.231c19.951,0,37.28-14.209,41.177-33.765l2.124-10.62 c5.524-27.609,19.885-51.478,39.382-69.717l12.708,18.95C342.058,298.1,332,321.951,332,346c0,48.426,40.715,90,90,90 c49.629,0,90-40.371,90-90C512,296.371,471.629,256,422,256z M90,375.9h51.855C131.336,393.973,111.793,406,90,406	c-33.091,0-60-26.909-60-60s26.909-60,60-60c6.667,0,13.081,1.32,19.265,3.431l5.242,7.863	C122.314,309.013,135.381,316,149.443,316H90c-16.569,0-30,13.431-30,30C60,362.569,73.431,375.9,90,375.9z M422,406 c-32.501,0-60-27.297-60-60c0-13.865,4.856-27.697,15.397-39.593l32.151,47.943c4.563,6.833,13.904,8.752,20.801,4.102	c6.885-4.614,8.716-13.931,4.102-20.801l-32.161-47.955C409.529,287.163,414.363,286,422,286c33.091,0,60,26.909,60,60S455.091,406,422,406z",
  },
  car: {
    key: "car",
    svg: car,
    scale: 0.1,
    anchorX: 256,
    anchorY: 512,
    path:
      "M120,236a52,52,0,1,0,52,52A52.059,52.059,0,0,0,120,236Zm0,76a24,24,0,1,1,24-24A24,24,0,0,1,120,312Z M408,236a52,52,0,1,0,52,52A52.059,52.059,0,0,0,408,236Zm0,76a24,24,0,1,1,24-24A24,24,0,0,1,408,312Z M477.4,193.04,384,176l-79.515-65.975A44.109,44.109,0,0,0,276.526,100H159.38a43.785,43.785,0,0,0-34.359,16.514L74.232,176H40A36.04,36.04,0,0,0,4,212v44a44.049,44.049,0,0,0,44,44h9.145a64,64,0,1,1,125.71,0h162.29a64,64,0,1,1,125.71,0H472a36.04,36.04,0,0,0,36-36V228.632A35.791,35.791,0,0,0,477.4,193.04ZM180,164a12,12,0,0,1-12,12H115.245a6,6,0,0,1-4.563-9.9l34.916-40.9A12,12,0,0,1,154.724,121H168a12,12,0,0,1,12,12Zm60,56H224a12,12,0,0,1,0-24h16a12,12,0,0,1,0,24Zm94.479-43.706-114.507-.266a12,12,0,0,1-11.972-12V133a12,12,0,0,1,12-12h57.548a12,12,0,0,1,7.433,2.58l53.228,42A6,6,0,0,1,334.479,176.294Z",
  },
  bus: {
    key: "bus",
    svg: bus,
    scale: 0.1,
    anchorX: 0,
    anchorY: 256,
    path:
      "M112,320a48,48,0,1,0,48,48A48.055,48.055,0,0,0,112,320Zm0,72a24,24,0,1,1,24-24A24,24,0,0,1,112,392Z M505.984,201.344l-28.437-42.656A23.949,23.949,0,0,0,457.578,148H28A24.028,24.028,0,0,0,4,172V324H71.265a59.854,59.854,0,0,1,81.47,0h206.53a59.854,59.854,0,0,1,81.47,0H508V208A11.992,11.992,0,0,0,505.984,201.344ZM200,228a12,12,0,0,1-12,12H64a12,12,0,0,1-12-12V178a12,12,0,0,1,12-12H188a12,12,0,0,1,12,12Zm176,0a12,12,0,0,1-12,12H236a12,12,0,0,1-12-12V178a12,12,0,0,1,12-12H364a12,12,0,0,1,12,12Zm112,55.3c-1.253.443-44,.7-44,.7a12,12,0,0,1-12-12V178a12,12,0,0,1,12-12h14.422l27.562,35.344A11.992,11.992,0,0,1,488,208Z M460,368a59.61,59.61,0,0,1-6.957,28H484a24.028,24.028,0,0,0,24-24V348H456.56A59.718,59.718,0,0,1,460,368Z M55.44,348H4v24a24.028,24.028,0,0,0,24,24H58.957a59.839,59.839,0,0,1-3.517-48Z M343.44,348H168.56a59.839,59.839,0,0,1-3.517,48H346.957a59.839,59.839,0,0,1-3.517-48Z M400,320a48,48,0,1,0,48,48A48.055,48.055,0,0,0,400,320Zm0,72a24,24,0,1,1,24-24A24,24,0,0,1,400,392Z",
  },
  truck: {
    key: "truck",
    svg: truck,
    scale: 0.1,
    anchorX: 234.5,
    anchorY: 469,
    path:
      "M405.333,149.333h-64V64H42.667C19.093,64,0,83.093,0,106.667v234.667h42.667c0,35.307,28.693,64,64,64s64-28.693,64-64	h128c0,35.307,28.693,64,64,64c35.307,0,64-28.693,64-64h42.667V234.667L405.333,149.333z M106.667,373.333 c-17.707,0-32-14.293-32-32s14.293-32,32-32s32,14.293,32,32S124.373,373.333,106.667,373.333z M362.667,373.333 c-17.707,0-32-14.293-32-32s14.293-32,32-32s32,14.293,32,32S380.373,373.333,362.667,373.333z M341.333,234.667v-53.333h53.333 l41.92,53.333H341.333z",
  },
  train: {
    key: "train",
    svg: train,
    scale: 0.1,
    anchorX: 241,
    anchorY: 482,
    path:
      "M418.537,194.612C352.231,139.598,268.781,109.4,182.63,109.4H0v100.463v104.808v0.516h22.866	c5.439,10.377,16.19,17.53,28.72,17.53c12.528,0,23.28-7.153,28.718-17.53h74.03c5.438,10.377,16.19,17.53,28.72,17.53 c12.528,0,23.28-7.153,28.72-17.53h74.028c5.439,10.377,16.191,17.53,28.719,17.53s23.28-7.153,28.72-17.53l44.12-0.011 c28.97,0,94.337-23.99,94.321-52.92C481.689,250.502,452.813,223.05,418.537,194.612z M32.053,141.454H182.63 c24.971,0,49.668,3.105,73.794,8.537v36.779c0,14.094,11.434,25.527,25.527,25.527h106.92c3.043,2.355,6.228,4.515,9.203,6.98 c12.042,9.994,21.261,18.108,28.508,24.791H32.053v-34.205V141.454z M60.1,214.019h35.058c1.659,0,3.005-1.346,3.005-3.005v-35.058c0-1.659-1.346-3.005-3.005-3.005H60.1 c-1.659,0-3.005,1.346-3.005,3.005v35.058C57.094,212.673,58.44,214.019,60.1,214.019z M124.206,214.019h35.058c1.659,0,3.005-1.346,3.005-3.005v-35.058c0-1.659-1.346-3.005-3.005-3.005 h-35.058c-1.659,0-3.005,1.346-3.005,3.005v35.058C121.201,212.673,122.547,214.019,124.206,214.019z M188.312,214.019h35.058c1.659,0,3.005-1.346,3.005-3.005v-35.058c0-1.659-1.346-3.005-3.005-3.005 h-35.058c-1.659,0-3.005,1.346-3.005,3.005v35.058C185.307,212.673,186.653,214.019,188.312,214.019z M431.465,340.228H0v32.053h431.465c8.85,0,16.027-7.177,16.027-16.026S440.315,340.228,431.465,340.228z",
  },
  boat: {
    key: "boat",
    svg: boat,
    scale: 0.1,
    anchorX: 183.5,
    anchorY: 367,
    path:
      "M278.32,202.74l-77.36-97.12V210.1h73.8c1.739,0.003,3.326-0.993,4.08-2.56C279.598,205.972,279.396,204.11,278.32,202.74	z M362.6,232.62c-0.013,0-0.027,0-0.04,0H188.12V50.98c-0.008-0.548-0.116-1.091-0.32-1.6l-0.24-0.48 c-0.161-0.33-0.363-0.639-0.6-0.92l-0.4-0.4c-0.278-0.251-0.588-0.466-0.92-0.64l-0.44-0.24c-0.464-0.157-0.95-0.238-1.44-0.24 h-0.32c-0.436,0.018-0.867,0.099-1.28,0.24l-0.52,0.24c-0.317,0.164-0.612,0.365-0.88,0.6l-0.4,0.36h-0.2L56.88,202.74 c-1.547,1.988-1.189,4.853,0.799,6.399c0.79,0.615,1.76,0.952,2.761,0.961H179v22.52H4.56c-2.496-0.022-4.538,1.983-4.56,4.48 c0,0.027,0,0.054,0,0.08c0.066,46.109,37.451,83.458,83.56,83.48h200c46.124-0.022,83.516-37.396,83.56-83.52	C367.12,234.644,365.097,232.62,362.6,232.62z",
  },
  drone: {
    key: "drone",
    svg: drone,
    scale: 0.1,
    anchorX: 320,
    anchorY: 320,
    path:
      "m271 121v30h50.992188c41.328124 0 75 33.671875 75 75v19.996094c0 8.285156-6.714844 15-15 15-8.28125 0-15-6.714844-15-15v-19.996094c0-24.765625-20.230469-45-45-45h-132c-24.765626 0-45 20.234375-45 45v20c0 8.285156-6.714844 15-15 15-8.28125 0-15-6.714844-15-15v-20c0-41.328125 33.671874-75 75-75h51.007812v-30h-183c-8.285156 0-15-6.714844-15-15v-35h-28c-8.285156 0-15-6.714844-15-15s6.714844-15 15-15h28v-4c0-8.285156 6.714844-15 15-15s15 6.714844 15 15v4h28c8.285156 0 15 6.714844 15 15 0 8.28125-6.714844 15-15 15h-28v20h61.996094l7.808594-17.675781c20.042968-45.371094 62.914062-73.324219 112.503906-73.324219 25.648437 0 48.351562 6.417969 68.628906 19.617188 19.453125 12.660156 35.152344 30.953124 45.191406 53.632812l7.859375 17.75h62.011719v-20h-28c-8.285156 0-15-6.714844-15-15s6.714844-15 15-15h28v-4c0-8.285156 6.714844-15 15-15s15 6.714844 15 15v4h28c8.285156 0 15 6.714844 15 15 0 8.28125-6.714844 15-15 15h-28v35c0 8.285156-6.714844 15-15 15zm-81 87c-8.285156 0-15 6.714844-15 15v131c0 8.285156 6.714844 15 15 15h132c8.285156 0 15-6.714844 15-15v-131c0-8.285156-6.714844-15-15-15h-51v41c0 8.285156-6.714844 15-15 15s-15-6.714844-15-15v-41zm0 0",
  },
  helicopter: {
    key: "helicopter",
    svg: helicopter,
    scale: 0.1,
    anchorX: 256,
    anchorY: 256,
    path:
      "m456.37 167.014a60.133 60.133 0 0 0 -52.1-30.231h-88.14v-56h180a12 12 0 0 0 0-24h-180v-4a12 12 0 0 0 -24 0v4h-180a12 12 0 0 0 0 24h180v56h-22.33a59.67 59.67 0 0 0 -53.665 33.167l-15.417 30.833h-163.663l-9.783-24.457a12 12 0 1 0 -22.283 8.913l32 80a12.082 12.082 0 0 0 11.218 7.544h171.923l48 36a60.378 60.378 0 0 0 36 12h7.351l13.265 39.795a12 12 0 0 0 11.384 8.205h144a12 12 0 0 0 0-24h-39.35l-8-24h12.754a59.925 59.925 0 0 0 56.921-41.027l5.06-15.178a12 12 0 0 0 -.966-9.749zm-111.591 177.769-8-24h70.7l8 24zm126.142-72h-47.14a59.931 59.931 0 0 1 -55.148-36.365l-26.439-61.691a12 12 0 0 1 11.029-16.727h66.041a12 12 0 0 1 10.43 6.065l51.657 90.783a12 12 0 0 1 -10.43 17.935z",
  },
  defaultIcon: {
    key: "defaultIcon",
    svg: defaultIcon,
    scale: 0.1,
    anchorX: 197,
    anchorY: 394,
    path:
      "M197.127,0c-77.197,0-140,62.806-140,140.002c0,31.703,20.895,81.688,63.879,152.813 c30.721,50.832,60.926,92.583,62.197,94.335c3.236,4.46,8.412,7.104,13.924,7.104c5.512,0,10.689-2.644,13.926-7.104	c1.27-1.752,31.477-43.503,62.195-94.335c42.984-71.125,63.879-121.11,63.879-152.813C337.127,62.806,274.324,0,197.127,0z M201.801,172.82c-0.057-0.538,0.119-1.075,0.482-1.474c0.199-0.224,0.447-0.395,0.719-0.502v-4.763 c0-0.929,0.666-1.721,1.576-1.883c1.518-0.27,3.076-0.825,4.639-1.648c0.594-0.313,1.307-0.295,1.881,0.051	c0.574,0.346,0.924,0.967,0.924,1.639l0.002,11.419c0,0.418-0.135,0.82-0.385,1.15l-5.363,7.12	c-0.367,0.486-0.938,0.762-1.527,0.762c-0.17,0-0.344-0.024-0.512-0.073c-0.758-0.208-1.309-0.862-1.389-1.644L201.801,172.82z M202.26,154.088h-10.266c-2.27,0-6.65-3.033-11.322-9.814c-3.691-5.349-6.256-11.266-6.859-15.833l-0.104-0.791l-1.854-1.207	c-0.543-0.352-0.871-0.954-0.871-1.6v-3.147c0-1.058,0.857-1.911,1.912-1.911h0.781v-3.41c0-0.722,0.408-1.384,1.057-1.708 c2.631-1.314,7.854-3.518,13.26-3.518c4.314,0,7.891,1.437,10.631,4.263c3.414,3.53,7.35,5.32,11.697,5.32	c2.461,0,5.006-0.582,7.563-1.726c0.59-0.267,1.273-0.213,1.818,0.139c0.256,0.165,0.463,0.387,0.609,0.64h1.045 c1.055,0,1.91,0.854,1.91,1.911v3.147c0,0.646-0.326,1.248-0.869,1.6l-1.855,1.207l-0.102,0.785 c-0.605,4.572-3.168,10.49-6.861,15.84C208.908,151.056,204.529,154.088,202.26,154.088z M191.971,171.347 c0.363,0.398,0.539,0.936,0.482,1.474l-1.047,10.156c-0.08,0.785-0.631,1.437-1.389,1.647c-0.17,0.048-0.342,0.07-0.512,0.07	c-0.592,0-1.16-0.273-1.527-0.761l-5.371-7.124c-0.25-0.332-0.385-0.734-0.385-1.15l0.008-11.422c0-0.67,0.352-1.291,0.926-1.637 s1.285-0.365,1.879-0.05c1.563,0.823,3.123,1.379,4.639,1.648c0.912,0.162,1.576,0.954,1.576,1.883v4.763 C191.523,170.952,191.772,171.123,191.971,171.347z M258.922,199.752c-4.084-15.856-9.832-31.474-16.93-33.513l-21.26-6.444 c-0.514-1.557-1.652-2.898-3.244-4.034c1.752-1.947,3.23-3.919,4.355-5.55c2.668-3.869,4.887-8.034,6.426-12.056	c0.758-1.697,1.402-3.398,1.926-5.07c2.07-1.732,3.289-4.323,3.289-7.043v-6.658c0-1.909-0.602-3.779-1.705-5.328v-9.372	c0-16.443-13.379-29.818-29.82-29.818h-9.664c-16.441,0-29.82,13.375-29.82,29.818v9.373c-1.105,1.55-1.705,3.42-1.705,5.327v6.658	c0,2.715,1.219,5.306,3.289,7.041c0.521,1.672,1.168,3.375,1.926,5.076c1.537,4.018,3.758,8.184,6.426,12.05	c1.125,1.63,2.604,3.603,4.355,5.551c-1.592,1.136-2.73,2.478-3.244,4.034l-21.26,6.444c-7.098,2.039-12.846,17.656-16.93,33.513 c-14.977-15.483-24.207-36.558-24.207-59.75c0-47.422,38.58-86.004,86.002-86.004c47.422,0,86.002,38.582,86.002,86.004 C283.129,163.194,273.898,184.268,258.922,199.752z",
  },
} as UserIcons;

export default userIcons;
export const getUserIconByKey = (iconKey = "defaultIcon") => {
  const icon = Object.values(userIcons).find((item) => item.key === iconKey);
  if (!icon) {
    return userIcons["defaultIcon"];
  }
  return icon;
};
