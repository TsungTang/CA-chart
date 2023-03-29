const shapValueApiData = {
  status: 'success',
  summary: {
    n_size: 1,
    n_features: 6
  },
  graph: [
    // 第一層 List (相容一次輸入多筆計算 SHAP 值)
    [
      // 第二層 List，針對單筆資料的 SHAP 值結果
      {
        name: 'x1',
        value: -1.105935076, // 可能是 數值 或 字串
        min: 0.08362646433746879,
        q1: 0.08483303750603138,
        median: 0.08889748240157824, // not used
        q3: 0.09084342872907869,
        max: 0.09158901842603207,
        mean: 0.08805989967788455
      },
      {
        name: 'x2sdgx1sdgx1sdgx1sdgx1sdgx1sdgx1sdgx1sdgx1sdgx1sdgx1sdgx1sdgx1sdgx1sdgx1sdgx1sdg',
        value: -1.6545154524,
        min: 0.06228194891985761,
        q1: 0.06561890152989514,
        median: 0.06561890152989514,
        q3: 0.06561890152989514,
        max: 0.06995184123236875,
        mean: 0.06563252594160088
      },
      {
        name: 'x3sad',
        value: 'C',
        min: 0.0037174946216036453,
        q1: 0.00383889891100897,
        median: 0.006384718743764617,
        q3: 0.00894286653617593,
        max: 0.011420076170834847,
        mean: 0.006885091854558667
      },
      {
        name: 'x4sfewfrg4egeshijewothjoewjhoejhtjeohjosdifjhoisdjhojths',
        value: 'Asss',
        min: -0.007036931266756752,
        q1: -0.008443709455989601,
        median: -0.008807922324205575,
        q3: -0.009104036860341003,
        max: -0.009455344985910275,
        mean: -0.0087199977600509
      },
      {
        name: 'x5',
        value: 1.24,
        min: -0.007036931266756752,
        q1: -0.008443709455989601,
        median: -0.009807922324205575,
        q3: -0.009104036860341003,
        max: -0.009455344985910275,
        mean: -0.0097199977600509
      },
      {
        name: 'x6',
        value: -0.023411,
        min: -0.007036931266756752,
        q1: -0.008443709455989601,
        median: -0.018807922324205575,
        q3: -0.009104036860341003,
        max: -0.009455344985910275,
        mean: -0.017199977600509
      }
    ]
  ],
  msg: 'none',
  pkg: 'tukeyCorePy_0.2.1'
};

export const inputData = shapValueApiData.graph[0].map(d => {
  const xVal =
    typeof d.value === 'number'
      ? String(Math.round((d.value + Number.EPSILON) * 1000) / 1000)
      : `"${d.value}"`;
  return {
    name: `${d.name} = ${xVal}`,
    value: d.mean
  };
});
