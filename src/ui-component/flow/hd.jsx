const hierarchyData =
  // {
  //   id: "plant",
  //   label: "Plant",
  //   children: [
  {
    id: 'rmu',
    label: 'RMU',
    mongoId: '64b7f9e2f1a2c8d1e4a12345',
    children: [
      {
        id: 'htpanel',
        label: 'HT Panel',
        mongoId: '64b7f9e2f1a2c8d1e4a12346',
        children: [
          {
            id: 'transformer1',
            label: 'Transformer 1',
            children: [
              {
                id: 'ltincomer1',
                label: 'LT Incomer 1',
                children: [
                  {
                    id: 'feeder1',
                    label: 'Feeder 1',
                    children: [
                      { id: 'admin', label: 'Admin' },
                      { id: 'shopfloor1', label: 'Shop Floor 1' },
                      { id: 'shopfloor2', label: 'Shop Floor 2' },
                      { id: 'switchgear', label: 'Switchgear' },
                      { id: 'forgingplant', label: 'Forging plant' },
                      { id: 'streetlight', label: 'Street Light' },
                      { id: 'controlroom', label: 'Control Room' },
                      { id: 'fqcpacking', label: 'FQC & Packing' }
                    ]
                  },
                  {
                    id: 'feeder2',
                    label: 'Feeder 2',
                    children: [
                      { id: 'compressor1', label: 'Compressor 1' },
                      { id: 'compressor2', label: 'Compressor 2' },
                      { id: 'compressor3', label: 'Compressor 3' },
                      { id: 'mixer1', label: 'Mixer 1' },
                      { id: 'mixer2', label: 'Mixer 2' },
                      { id: 'mixer3', label: 'Mixer 3' },
                      { id: 'boiler1', label: 'Boiler 1' },
                      { id: 'heatex1', label: 'Heat Ex 1' },
                      { id: 'heatex2', label: 'Heat Ex 2' },
                      { id: 'chiller1', label: 'Chiller 1' },
                      { id: 'chiller2', label: 'Chiller 2' },
                      { id: 'chiller3', label: 'Chiller 3' }
                    ]
                  }
                ]
              }
            ]
          },

          {
            id: 'transformer2',
            label: 'Transformer 2',
            children: [
              {
                id: 'ltincomer2',
                label: 'LT Incomer 2',
                children: [
                  {
                    id: 'feeder3',
                    label: 'Feeder 3',
                    children: [
                      { id: 'hypress1', label: 'Hy. Press 1' },
                      { id: 'hypress2', label: 'Hy. Press 2' },
                      { id: 'hammer', label: 'Hammer' },
                      { id: 'punching1', label: 'Punching 1' },
                      { id: 'punching2', label: 'Punching 2' }
                    ]
                  },
                  {
                    id: 'feeder4',
                    label: 'Feeder 4',
                    children: [
                      { id: 'heater1', label: 'Heater 1' },
                      { id: 'heater2', label: 'Heater 2' },
                      { id: 'conveyor1', label: 'Conveyor 1' },
                      { id: 'conveyor2', label: 'Conveyor 2' },
                      { id: 'conveyor3', label: 'Conveyor 3' },
                      { id: 'conveyor4', label: 'Conveyor 4' },
                      { id: 'blower1', label: 'Blower 1' },
                      { id: 'blower2', label: 'Blower 2' }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'rmupanel',
        label: 'RMU Panel'
      }
    ]
  };
